'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { CandidateContext, InterviewDuration, InterviewType } from '@/types/interview';
import { SAMPLE_DEMO_RESUME_TEXT } from '@/services/storage/sessionStore';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToLobby: (config: CandidateContext) => void;
  initialFocusArea?: string;
  initialContext?: Partial<CandidateContext> | null;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onProceedToLobby,
  initialFocusArea,
  initialContext,
}) => {
  const [role, setRole] = useState('Software Engineer Intern');
  const [company, setCompany] = useState('Microsoft');
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [duration, setDuration] = useState<InterviewDuration>(10);
  const [resumeText, setResumeText] = useState('');
  const [focusArea, setFocusArea] = useState(initialFocusArea || '');
  const [isSampleDemo, setIsSampleDemo] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    characterCount: number;
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialContext) {
        if (initialContext.role) setRole(initialContext.role);
        if (initialContext.company !== undefined) setCompany(initialContext.company || '');
        if (initialContext.interviewType) setInterviewType(initialContext.interviewType);
        if (initialContext.durationMinutes) setDuration(initialContext.durationMinutes);
        if (initialContext.isSampleDemo !== undefined) setIsSampleDemo(Boolean(initialContext.isSampleDemo));
        if (initialContext.resumeText !== undefined) {
          setResumeText(initialContext.resumeText || '');
          if (initialContext.resumeText && initialContext.resumeText.trim().length > 0) {
            setUploadedFile({
              name: initialContext.isSampleDemo ? 'demo-resume.pdf (Alex Chen)' : 'Grounded Resume',
              size: initialContext.resumeText.length,
              characterCount: initialContext.resumeText.length,
            });
          } else {
            setUploadedFile(null);
          }
        }
        setFocusArea(initialContext.focusArea || initialFocusArea || '');
      } else {
        setFocusArea(initialFocusArea || '');
      }
    }
  }, [initialFocusArea, initialContext, isOpen]);

  const handleApplySampleDemoPreset = () => {
    setRole('Software Engineer');
    setCompany('TechCorp Solutions');
    setInterviewType('behavioural');
    setDuration(10);
    setResumeText(SAMPLE_DEMO_RESUME_TEXT);
    setUploadedFile({
      name: 'demo-resume.pdf (Alex Chen)',
      size: 1592,
      characterCount: 1592,
    });
    setFocusArea('');
    setIsSampleDemo(true);
    setParseError(null);
  };

  const handleFileUpload = async (file: File) => {
    setParseError(null);
    setIsParsing(true);
    setIsSampleDemo(false);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      setResumeText(data.text);
      setUploadedFile({
        name: data.filename,
        size: data.fileSize,
        characterCount: data.characterCount,
      });
    } catch (err: any) {
      setParseError(err.message || 'Error processing file');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setResumeText('');
    setParseError(null);
    setIsSampleDemo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadDemoResume = async () => {
    setParseError(null);
    setIsParsing(true);
    try {
      setResumeText(SAMPLE_DEMO_RESUME_TEXT);
      setUploadedFile({
        name: 'demo-resume.pdf (Alex Chen)',
        size: 1592,
        characterCount: 1592,
      });
      setIsParsing(false);
    } catch (err: any) {
      setParseError('Failed to load demo resume');
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceedToLobby({
      role: role.trim() || 'Software Engineer Intern',
      company: company.trim() || undefined,
      interviewType,
      durationMinutes: duration,
      resumeText: resumeText.trim() || undefined,
      focusArea: focusArea.trim() || undefined,
      targetQuestions: isSampleDemo ? 5 : initialContext?.targetQuestions,
      isSampleDemo,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md"
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="w-full sm:max-w-[460px] max-h-[92vh] sm:max-h-[85vh] rounded-t-[24px] sm:rounded-[20px] bg-white dark:bg-[#212121] apple-hairline overflow-hidden shadow-2xl flex flex-col pb-safe"
          >
        {/* iOS Pull Handle on Mobile */}
        <div className="sm:hidden w-10 h-1 bg-black/15 dark:bg-white/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Navigation Bar Header */}
        <div className="flex items-center justify-between px-5 h-12 apple-hairline-b">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] text-apple-inkMuted hover:text-apple-ink dark:hover:text-white transition-colors apple-action"
          >
            Cancel
          </button>

          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-apple-ink dark:text-white">
            Interview Setup
          </h2>

          <button
            type="button"
            onClick={handleSubmit}
            className="text-[14px] font-semibold text-apple-amber-500 hover:text-apple-amber-600 transition-colors apple-action"
          >
            Continue
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-left overflow-y-auto flex-1">
          {/* Quick Demo Preset Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
            <div className="min-w-0 pr-2">
              <p className="text-[13px] font-semibold text-apple-ink dark:text-white">
                Presentation Demo Preset
              </p>
              <p className="text-[11px] text-apple-inkMuted truncate">
                5-question behavioral rehearsal with Alex Chen resume
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplySampleDemoPreset}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all apple-action ${
                isSampleDemo
                  ? 'bg-[#D05236] text-white shadow-sm'
                  : 'bg-black/[0.04] dark:bg-white/[0.08] text-apple-ink dark:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
              }`}
            >
              {isSampleDemo ? 'Applied ✓' : 'Use Preset'}
            </button>
          </div>

          {focusArea && (
            <div className="p-3 rounded-xl bg-apple-amber-500/10 text-[13px] leading-snug">
              <span className="font-medium text-apple-amber-500">Targeting weakness: </span>
              <span className="text-apple-ink dark:text-white">{focusArea}</span>
            </div>
          )}

          {/* Group 1: Role & Company */}
          <div>
            <h3 className="text-[14px] font-semibold text-apple-ink dark:text-white mb-2">
              Position
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role (e.g. Software Engineer Intern)"
                className="w-full px-3.5 py-2.5 sm:py-2 text-[16px] sm:text-[14px] text-apple-ink dark:text-white bg-black/[0.03] dark:bg-white/[0.05] apple-hairline rounded-xl focus:outline-none focus:ring-1 focus:ring-apple-amber-500"
              />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company (Optional)"
                className="w-full px-3.5 py-2.5 sm:py-2 text-[16px] sm:text-[14px] text-apple-ink dark:text-white bg-black/[0.03] dark:bg-white/[0.05] apple-hairline rounded-xl focus:outline-none focus:ring-1 focus:ring-apple-amber-500"
              />
            </div>
          </div>

          {/* Group 2: Interview Type Segmented Control */}
          <div>
            <h3 className="text-[14px] font-semibold text-apple-ink dark:text-white mb-2">
              Interview Format
            </h3>
            <div className="flex p-1 bg-black/[0.03] dark:bg-white/[0.06] rounded-[12px] relative">
              {(['technical', 'behavioural', 'mixed'] as InterviewType[]).map((type) => {
                const isSelected = interviewType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setInterviewType(type)}
                    className={`relative flex-1 py-2 sm:py-1.5 text-[13px] font-medium capitalize rounded-[9px] transition-colors apple-action z-10 ${
                      isSelected
                        ? 'text-apple-ink dark:text-white'
                        : 'text-apple-inkMuted hover:text-apple-ink dark:hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="active-format-pill"
                        className="absolute inset-0 bg-white dark:bg-[#2A2A2A] rounded-[9px] shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3: Duration Segmented Control */}
          <div>
            <h3 className="text-[14px] font-semibold text-apple-ink dark:text-white mb-2">
              Duration
            </h3>
            <div className="flex p-1 bg-black/[0.03] dark:bg-white/[0.06] rounded-[12px] relative">
              {([10, 20, 30] as InterviewDuration[]).map((mins) => {
                const isSelected = duration === mins;
                return (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`relative flex-1 py-2 sm:py-1.5 text-[13px] font-medium rounded-[9px] transition-colors apple-action z-10 ${
                      isSelected
                        ? 'text-apple-ink dark:text-white'
                        : 'text-apple-inkMuted hover:text-apple-ink dark:hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="active-duration-pill"
                        className="absolute inset-0 bg-white dark:bg-[#2A2A2A] rounded-[9px] shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    {mins} min
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 4: Resume File Upload & Grounding */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-semibold text-apple-ink dark:text-white">
                Resume Context
              </h3>
              {uploadedFile && (
                <span className="text-[12px] text-[#31805A] dark:text-[#3db57a] font-medium flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Grounded
                </span>
              )}
            </div>

            {uploadedFile ? (
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] apple-hairline space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-apple-amber-500/10 text-apple-amber-500 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-apple-ink dark:text-white truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[12px] text-apple-inkMuted">
                        {formatFileSize(uploadedFile.size)} • {uploadedFile.characterCount.toLocaleString()} chars parsed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[12px] font-medium text-apple-inkMuted hover:text-apple-ink dark:hover:text-white transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 text-apple-inkMuted hover:text-red-500 transition-colors"
                      title="Remove resume"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[12px]">
                  <span className="text-[12px] text-apple-inkMuted">
                    AI will challenge your real projects & stack
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-apple-amber-500 hover:underline inline-flex items-center text-[12px] font-medium"
                  >
                    {showPreview ? 'Hide preview' : 'View extracted text'}
                    {showPreview ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                  </button>
                </div>

                {showPreview && (
                  <div className="pt-2">
                    <textarea
                      rows={4}
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="w-full p-2.5 text-[12px] font-mono text-apple-ink dark:text-white bg-black/[0.03] dark:bg-white/[0.05] apple-hairline rounded-xl focus:outline-none focus:ring-1 focus:ring-apple-amber-500 resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            ) : isParsing ? (
              <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] apple-hairline flex flex-col items-center justify-center space-y-2 text-center">
                <Loader2 className="w-6 h-6 text-apple-amber-500 animate-spin" />
                <p className="text-[13px] font-medium text-apple-ink dark:text-white">
                  Extracting and parsing resume...
                </p>
                <p className="text-[12px] text-apple-inkMuted">
                  Grounding questions in your actual background
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-6 rounded-2xl border border-dashed transition-all duration-200 text-center cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                  isDragging
                    ? 'border-apple-amber-500 bg-apple-amber-500/[0.05] scale-[1.01]'
                    : 'border-black/15 dark:border-white/15 bg-black/[0.01] dark:bg-white/[0.02] hover:border-apple-amber-500/50 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-apple-amber-500/10 text-apple-amber-500 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-apple-ink dark:text-white">
                    Upload Resume for AI Grounding
                  </p>
                  <p className="text-[12px] text-apple-inkMuted mt-0.5">
                    Drag & drop or click to browse (PDF, DOCX, TXT up to 10MB)
                  </p>
                </div>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md,.markdown"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {parseError && (
              <p className="mt-2 text-[12px] text-red-500 font-medium">
                {parseError}
              </p>
            )}

            {/* Demo resume and manual text toggle */}
            {!uploadedFile && !isParsing && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[12px]">
                  <button
                    type="button"
                    onClick={handleLoadDemoResume}
                    className="text-apple-amber-600 dark:text-apple-amber-400 hover:underline font-medium"
                  >
                    + Load Demo Resume (Alex Chen)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-apple-inkMuted hover:text-apple-ink dark:hover:text-white transition-colors"
                  >
                    {showPreview ? 'Hide manual text' : 'Or paste text manually'}
                  </button>
                </div>
                {showPreview && (
                  <textarea
                    rows={3}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste key projects, work experience, and tech stack..."
                    className="w-full mt-2 px-3.5 py-2.5 text-[16px] sm:text-[13px] text-apple-ink dark:text-white bg-black/[0.03] dark:bg-white/[0.05] apple-hairline rounded-xl focus:outline-none focus:ring-1 focus:ring-apple-amber-500 resize-none leading-relaxed"
                  />
                )}
              </div>
            )}
          </div>

          {/* Bottom Button (Refined Apple Pill) */}
          <div className="pt-2 flex justify-center pb-2 sm:pb-0">
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 sm:py-2 rounded-full bg-apple-amber-500 hover:bg-apple-amber-600 text-white font-semibold text-[15px] sm:text-[14px] tracking-tight transition-all apple-action shadow-sm"
            >
              Continue to Lobby
            </button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
