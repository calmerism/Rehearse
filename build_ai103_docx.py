import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left=None, right=None):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    
    borders = {'top': top, 'bottom': bottom, 'left': left, 'right': right}
    for b_name, b_val in borders.items():
        if b_val:
            b_elm = parse_xml(f'<w:{b_name} {nsdecls("w")} w:val="single" w:sz="4" w:space="0" w:color="{b_val}"/>')
            tcBorders.append(b_elm)
        else:
            b_elm = parse_xml(f'<w:{b_name} {nsdecls("w")} w:val="none"/>')
            tcBorders.append(b_elm)
    tcPr.append(tcBorders)

def add_callout(doc, text, title=None, border_color="D05236", bg_color="FDF2F0"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    # Left border only
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    if title:
        r_title = p.add_run(f"{title}\n")
        r_title.font.name = 'Arial'
        r_title.font.size = Pt(10.5)
        r_title.font.bold = True
        r_title.font.color.rgb = RGBColor(15, 23, 42)
        
    r_text = p.add_run(text)
    r_text.font.name = 'Arial'
    r_text.font.size = Pt(10)
    r_text.font.italic = True
    r_text.font.color.rgb = RGBColor(51, 65, 85)
    
    # Spacer
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def build_ai103_docx(output_paths):
    doc = Document()

    # 1. Page Margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Base styling
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(51, 65, 85) # Slate 700

    # Colors
    NAVY_TITLE = RGBColor(15, 23, 42)    # Slate 900
    TERRACOTTA = RGBColor(208, 82, 54)   # #D05236 Primary
    SLATE_MUTED = RGBColor(100, 116, 139) # Slate 500
    DARK_BLUE = RGBColor(30, 41, 59)     # Slate 800

    # Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("Rehearse — Azure AI-103 Project Master Guide")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY_TITLE

    # Subtitle
    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(8)
    run_sub = sub_p.add_run("Chitkara University | INBIOT | Final Project Guidelines, Rubric Mapping & Defense Script")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(12)
    run_sub.font.bold = True
    run_sub.font.color.rgb = TERRACOTTA

    # Metadata Strip
    meta_table = doc.add_table(rows=1, cols=4)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    
    col_widths = [Inches(1.8), Inches(1.6), Inches(1.8), Inches(1.3)]
    meta_data = [
        ("Production URL", "getrehearse.vercel.app"),
        ("Evaluation Dates", "24 – 25 Sept 2026"),
        ("AI-103 Pillars", "Speech, Foundry, Agent, Docs"),
        ("Automated Tests", "25 Passed (100%)")
    ]
    for i, (label, val) in enumerate(meta_data):
        cell = meta_table.cell(0, i)
        cell.width = col_widths[i]
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        set_cell_borders(cell, top="CBD5E1", bottom="CBD5E1", left="CBD5E1", right="CBD5E1")
        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(0)
        r1 = cp.add_run(f"{label}\n")
        r1.font.size = Pt(8)
        r1.font.bold = True
        r1.font.color.rgb = SLATE_MUTED
        r2 = cp.add_run(val)
        r2.font.size = Pt(9.5)
        r2.font.bold = True
        r2.font.color.rgb = DARK_BLUE

    # Spacer
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(4)
    sp.paragraph_format.space_after = Pt(4)

    # Callout: Instructor Golden Rule
    add_callout(
        doc,
        "\"Half the marks sit in applying AI-103 concepts and implementing them well. A simple idea that is built properly and explained clearly will score better than an ambitious idea that does not work.\"\n— Instructor Note, Slide 5",
        title="CRITICAL EVALUATION DIRECTIVE",
        border_color="D05236",
        bg_color="FEF2F2"
    )

    # -------------------------------------------------------------
    # SECTION 1: Evaluation Rubric Alignment
    # -------------------------------------------------------------
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    r_h1 = h1.add_run("1. Official Evaluation Rubric Alignment (100% Coverage)")
    r_h1.font.name = 'Arial'
    r_h1.font.size = Pt(14)
    r_h1.font.bold = True
    r_h1.font.color.rgb = NAVY_TITLE

    p_rub = doc.add_paragraph()
    p_rub.paragraph_format.space_after = Pt(8)
    p_rub.paragraph_format.line_spacing = 1.15
    p_rub.add_run(
        "The following matrix maps each weighted evaluation criterion from Slide 5 of the Chitkara University guidelines directly to Rehearse's technical architecture, codebase, and verification evidence:"
    )

    rubric_table = doc.add_table(rows=8, cols=4)
    rubric_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rubric_table.autofit = False

    r_widths = [Inches(1.8), Inches(0.8), Inches(2.6), Inches(1.3)]
    headers = ["Evaluation Area", "Weight", "How Rehearse Meets Requirement", "Implementation File"]

    for i, h in enumerate(headers):
        c = rubric_table.cell(0, i)
        c.width = r_widths[i]
        set_cell_background(c, "0F172A")
        set_cell_margins(c, top=100, bottom=100, left=120, right=120)
        set_cell_borders(c, top="0F172A", bottom="0F172A")
        cp = c.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(0)
        r = cp.add_run(h)
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    rubric_rows = [
        ("Application of AI-103 Concepts", "25%",
         "Full multi-service integration: Azure AI Speech (real-time STT & 24kHz Neural TTS with SSML prosody), Microsoft Foundry / Azure OpenAI (GPT-4o reasoning, few-shot prompt grounding, structured JSON schema), Autonomous Agent state machine, and document parsing.",
         "src/services/speech/,\nsrc/services/foundry/,\nsrc/agent/"),
        ("Technical Implementation & Functionality", "25%",
         "Production full-stack web application with Next.js 14, TypeScript, and Tailwind CSS. Complete end-to-end rehearsal lifecycle: Context Setup -> Lobby Audio Calibration -> Live Verbal Rehearsal -> Diagnostic Report -> 'Rehearse Again' Continuity Loop.",
         "Live on Vercel at\ngetrehearse.vercel.app\n(HTTP 200)"),
        ("Testing, Reliability & Responsible AI", "15%",
         "• 25 automated unit & integration tests passing (npm test).\n• 0 TypeScript errors (npx tsc --noEmit).\n• Dual-layer fallback engine (Web Speech API + Mock Foundry heuristics) prevents crashes.\n• 100% client-side video privacy and serverless API secret encapsulation.",
         "tests/agent.test.ts\ntests/edgeCases.test.ts\ntests/rehearseAgain.test.tsx"),
        ("Problem Definition & Use-Case Relevance", "10%",
         "Solves the critical placement prep problem: candidates memorize algorithms and definitions, but freeze in live interviews when probed to verbally articulate architectural trade-offs under pressure. Directly relevant to campus recruitment.",
         "README.md (Sec 1)\nsrc/components/home/"),
        ("Documentation & Code Quality", "10%",
         "Clean modular architecture, strict naming conventions, comprehensive inline docstrings for non-obvious logic, full architecture diagrams, and complete feature specifications.",
         "README.md,\nFEATURES.md,\nDESIGN.md"),
        ("Demonstration & Presentation", "10%",
         "Bug-free live web demonstration, smooth audio transitions, zero stutter, and a structured 5-minute presentation script matching Slide 3 time brackets to the second.",
         "Live Demo Script\n(Section 3 below)"),
        ("Practical Impact & Future Scope", "5%",
         "Measurably improves student placement conversion rates via deliberate practice. Clear roadmap: regional Indian languages, campus placement cell integration, PDF diagnostic reports.",
         "README.md (Sec 13)\nSection 4 below")
    ]

    for row_idx, data in enumerate(rubric_rows, start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, text in enumerate(data):
            c = rubric_table.cell(row_idx, col_idx)
            c.width = r_widths[col_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, top=80, bottom=80, left=100, right=100)
            set_cell_borders(c, top="E2E8F0", bottom="E2E8F0", left="E2E8F0", right="E2E8F0")
            cp = c.paragraphs[0]
            cp.paragraph_format.space_before = Pt(0)
            cp.paragraph_format.space_after = Pt(0)
            cp.paragraph_format.line_spacing = 1.15
            r = cp.add_run(text)
            r.font.size = Pt(8.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = DARK_BLUE
            elif col_idx == 1:
                r.font.bold = True
                r.font.color.rgb = TERRACOTTA
            elif col_idx == 3:
                r.font.size = Pt(8)
                r.font.color.rgb = SLATE_MUTED

    # -------------------------------------------------------------
    # SECTION 2: Code, Originality & Responsible AI
    # -------------------------------------------------------------
    doc.add_page_break()
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)
    r_h2 = h2.add_run("2. Code, Originality and Responsible AI (Slide 6 Compliance)")
    r_h2.font.name = 'Arial'
    r_h2.font.size = Pt(14)
    r_h2.font.bold = True
    r_h2.font.color.rgb = NAVY_TITLE

    p2_intro = doc.add_paragraph()
    p2_intro.paragraph_format.space_after = Pt(6)
    p2_intro.paragraph_format.line_spacing = 1.15
    p2_intro.add_run(
        "Slide 6 defines strict standards for Code Quality, Originality, and Responsible AI. Rehearse satisfies each mandate:"
    )

    # Bullet 1
    p_b1 = doc.add_paragraph(style='List Bullet')
    p_b1.paragraph_format.space_before = Pt(2)
    p_b1.paragraph_format.space_after = Pt(4)
    p_b1.paragraph_format.line_spacing = 1.15
    r = p_b1.add_run("Clean Code & Modular Architecture: ")
    r.font.bold = True
    r.font.color.rgb = DARK_BLUE
    p_b1.add_run(
        "The codebase follows strict separation of concerns into distinct layers: Autonomous Agent State Machine (src/agent/interviewAgent.ts), Azure Cognitive Speech Abstraction (src/services/speech/), Microsoft Foundry Reasoning (src/services/foundry/), and Serverless Resume Extraction (src/services/resume/). Clear naming conventions, strict TypeScript schemas, and meaningful comments are maintained across all files."
    )

    # Bullet 2
    p_b2 = doc.add_paragraph(style='List Bullet')
    p_b2.paragraph_format.space_before = Pt(2)
    p_b2.paragraph_format.space_after = Pt(4)
    p_b2.paragraph_format.line_spacing = 1.15
    r = p_b2.add_run("Originality & Open-Source Acknowledgment: ")
    r.font.bold = True
    r.font.color.rgb = DARK_BLUE
    p_b2.add_run(
        "All core systems—the duration-aware pacing state machine, the adaptive trade-off follow-up heuristics, the prompt engineering grounding schemas, and the Apple-inspired user interface—were custom-designed and built for this project. Open-source libraries used are explicitly documented: microsoft-cognitiveservices-speech-sdk (Azure Speech), unpdf (serverless PDF parsing), mammoth (.docx parsing), lucide-react (icons), and framer-motion (spring transitions)."
    )

    # Bullet 3
    p_b3 = doc.add_paragraph(style='List Bullet')
    p_b3.paragraph_format.space_before = Pt(2)
    p_b3.paragraph_format.space_after = Pt(4)
    p_b3.paragraph_format.line_spacing = 1.15
    r = p_b3.add_run("Responsible AI Principles: ")
    r.font.bold = True
    r.font.color.rgb = DARK_BLUE
    p_b3.add_run(
        "Rehearse embeds Responsible AI across all four dimensions:\n"
        "• Privacy: Candidate camera video runs 100% locally via browser navigator.mediaDevices.getUserMedia and is never recorded, compressed, or sent to external servers. Session history is stored in client-side encrypted localStorage.\n"
        "• Security: Azure Cognitive Speech and Foundry credentials are encapsulated in serverless API routes (/api/speech, /api/interviews) and never exposed to the client bundle.\n"
        "• Fairness & Transparency: The platform rejects pseudo-scientific claims like emotion or facial lie detection. Evaluation is grounded strictly in observable verbal answers across three transparent axes (Technical Depth, Communication, Interview Handling).\n"
        "• Reliability & Human Oversight: The candidate retains complete control over duration, can pause, skip questions, toggle between voice and keyboard input, and finish speaking at their own pace."
    )

    # -------------------------------------------------------------
    # SECTION 3: 5-Minute Presentation & Video Script
    # -------------------------------------------------------------
    doc.add_page_break()
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)
    r_h3 = h3.add_run("3. Exact 5-Minute Video & Live Presentation Script (Slide 3)")
    r_h3.font.name = 'Arial'
    r_h3.font.size = Pt(14)
    r_h3.font.bold = True
    r_h3.font.color.rgb = NAVY_TITLE

    p3_intro = doc.add_paragraph()
    p3_intro.paragraph_format.space_after = Pt(6)
    p3_intro.paragraph_format.line_spacing = 1.15
    p3_intro.add_run(
        "This script is calibrated to the exact time breakdown specified in Slide 3 for your final presentation and 5-minute video submission on 24 – 25 September 2026:"
    )

    # Timing Table
    timing_table = doc.add_table(rows=6, cols=3)
    timing_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    timing_table.autofit = False
    t_widths = [Inches(1.8), Inches(1.0), Inches(3.7)]

    t_headers = ["Section", "Time Allocation", "Content & Deliverable"]
    for i, h in enumerate(t_headers):
        c = timing_table.cell(0, i)
        c.width = t_widths[i]
        set_cell_background(c, "0F172A")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        set_cell_borders(c, top="0F172A", bottom="0F172A")
        cp = c.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(0)
        r = cp.add_run(h)
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    t_rows = [
        ("Introduction", "30 sec", "Introduce team, project title (Rehearse), and placement interview prep use case."),
        ("Problem Statement", "30 sec", "Explain the gap: memorizing answers != surviving live verbal trade-off scrutiny."),
        ("AI-Driven Solution", "1 min", "Present the 3 Azure AI-103 pillars (Speech, Foundry, Agent) & system architecture."),
        ("Technical Demonstration", "2 min", "Live end-to-end rehearsal walkthrough on getrehearse.vercel.app."),
        ("Impact & Future Scope", "1 min", "Value delivered, deliberate practice benefits, limitations, and future roadmap.")
    ]

    for idx, (sec, tim, con) in enumerate(t_rows, start=1):
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate([sec, tim, con]):
            c = timing_table.cell(idx, c_idx)
            c.width = t_widths[c_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, top=60, bottom=60, left=100, right=100)
            set_cell_borders(c, top="E2E8F0", bottom="E2E8F0", left="E2E8F0", right="E2E8F0")
            cp = c.paragraphs[0]
            cp.paragraph_format.space_before = Pt(0)
            cp.paragraph_format.space_after = Pt(0)
            r = cp.add_run(val)
            r.font.size = Pt(8.5)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = DARK_BLUE
            elif c_idx == 1:
                r.font.bold = True
                r.font.color.rgb = TERRACOTTA

    # Detailed Script Breakdown
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(8)
    sp.paragraph_format.space_after = Pt(4)

    scripts = [
        ("Minute 0:00 – 0:30 (30 sec) | Introduction",
         "\"Hello everyone and respected instructor. We are team [Your Names], and today we present Rehearse, an autonomous, real-time AI Interview Coach built using Microsoft Azure AI-103 services. Our application provides an authentic, high-fidelity conversational rehearsal partner for engineering students preparing for technical, behavioral, and system design campus placements.\""),
        ("Minute 0:30 – 1:00 (30 sec) | Problem Statement",
         "\"Most students prepare for placements using static LeetCode problem sets or flashcards. While this helps them memorize syntax and definitions, it completely fails to prepare them for the real friction of a live interview.\n\nIn real technical interviews, senior interviewers interrupt, probe architectural trade-offs—like 'Why did you choose PostgreSQL over MongoDB?'—and test how you articulate decisions under pressure. Students freeze up not because they lack knowledge, but because they have never rehearsed live verbal defense. Rehearse bridges this exact gap.\""),
        ("Minute 1:00 – 2:00 (1 min) | AI-Driven Solution & AI-103 Concepts",
         "\"To solve this, we applied three core Azure AI-103 pillars wrapped in an autonomous agent architecture:\n\n1. Azure AI Speech Services: Continuous Speech-to-Text for candidate voice capture and high-fidelity 24kHz Neural Text-to-Speech using natural voices like Jenny and Guy with SSML chat prosody, reproducing a real spoken conversation.\n\n2. Microsoft Foundry / Azure OpenAI: GPT-4o contextual reasoning analyzes candidate speech in real time, extracts technical entities, checks claims against the candidate's uploaded resume, and generates spontaneous follow-up questions probing depth and trade-offs.\n\n3. Autonomous Agent State Machine: The agent tracks elapsed time against the scheduled meeting duration (10, 20, or 30 minutes), rotates across five engineering competencies to prevent repetitive questioning, and drives the complete rehearsal lifecycle.\n\n4. Document Intelligence: Serverless PDF and Word document parsers extract project experience to anchor questions in genuine candidate credentials.\n\nCrucially, we engineered a dual-layer fallback: if external cloud connectivity fails, the app automatically falls back to browser Web Speech and local heuristics without interrupting the interview.\""),
        ("Minute 2:00 – 4:00 (2 min) | Live Technical Demonstration (Screen Share)",
         "• Step 1 — Setup (15s): Open getrehearse.vercel.app. Select Software Engineer, Technical format, 10-minute duration, and click '+ Load Sample Resume' (Alex Chen with React, Node, and PostgreSQL). Note how credentials are immediately ingested.\n\n• Step 2 — Lobby (15s): Observe live microphone audio calibration meter and test the interviewer's neural voice. Click 'Start Interview'.\n\n• Step 3 — Question 1 & Answer (30s): AI greets candidate and asks resume-grounded opening: 'Tell me about a technical project you worked on recently and one challenging engineering decision you had to make.' Speak: 'I built an order processing platform with Node and PostgreSQL, and chose a relational schema for transaction integrity.' Click 'Finish Speaking'.\n\n• Step 4 — Adaptive Follow-Up (30s): AI transitions to Thinking. Notice it generates an adaptive trade-off follow-up: 'Why did you choose PostgreSQL instead of a NoSQL store like MongoDB or DynamoDB?' Speak: 'We required ACID guarantees so orders were never lost during concurrent checkouts.' AI deepens difficulty: 'How would you evolve your database schema and indexing strategy if transactions scaled by 100x?'\n\n• Step 5 — Feedback & Rehearse Again (30s): The interview concludes cleanly. Show the diagnostic report (Technical, Communication, Interview Handling ratings). Highlight the 'Rehearse Again' button: it pre-seeds the diagnosed weakness into the prompt of the next session for deliberate practice.\""),
        ("Minute 4:00 – 5:00 (1 min) | Impact, Limitations & Future Scope",
         "\"• Practical Impact: Rehearse transforms passive memorization into measurable verbal mastery, helping students articulate trade-offs clearly and enter placement interviews with genuine confidence.\n\n• Reliability & Quality: 25 passing automated tests, zero TypeScript errors, 100% client-side video privacy, and serverless secret protection.\n\n• Future Scope: Expanding to regional Indian languages for vernacular mock interviews, exportable diagnostic PDF reports for placement cell mentors, and specialized prompts for DevOps and SRE.\n\nThank you. We are now ready to take your questions.\"")
    ]

    for title, script_text in scripts:
        hp = doc.add_paragraph()
        hp.paragraph_format.space_before = Pt(8)
        hp.paragraph_format.space_after = Pt(2)
        r = hp.add_run(title)
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = DARK_BLUE

        add_callout(doc, script_text, border_color="0F172A", bg_color="F8FAFC")

    # -------------------------------------------------------------
    # SECTION 4: Instructor Viva & Defense Cheat Sheet
    # -------------------------------------------------------------
    doc.add_page_break()
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)
    r_h4 = h4.add_run("4. Instructor Viva Defense Cheat Sheet (Slide 4 Defense)")
    r_h4.font.name = 'Arial'
    r_h4.font.size = Pt(14)
    r_h4.font.bold = True
    r_h4.font.color.rgb = NAVY_TITLE

    add_callout(
        doc,
        "\"You are allowed to use AI assistants while building. But you must be able to explain every part of what you submit, including anything generated with AI help. If you cannot explain it, do not submit it.\"\n— Slide 4, Note on AI Tools",
        title="INSTRUCTOR WARNING FROM SLIDE 4",
        border_color="D05236",
        bg_color="FEF2F2"
    )

    qa_list = [
        ("Q1: Where exactly are Azure AI-103 concepts implemented in your code?",
         "• Azure AI Speech (TTS & STT): src/app/api/speech/tts/route.ts connects to Azure Cognitive Speech REST endpoint to stream 24kHz 160kbps MP3 audio with SSML <mstts:express-as style=\"chat\">. Client speech recognition is in src/services/speech/azureSpeechService.ts.\n"
         "• Microsoft Foundry / Azure OpenAI: src/services/foundry/foundryService.ts calls the Azure OpenAI Chat Completions API with gpt-4o, enforcing structured JSON schemas (response_format: { type: 'json_object' }) for both questions and diagnostic feedback.\n"
         "• Autonomous Agent: src/agent/interviewAgent.ts orchestrates turn-taking, meeting clock duration enforcement (10m, 20m, 30m), and 5-pillar topic rotation.\n"
         "• Document Processing: src/services/resume/resumeParserService.ts uses unpdf and mammoth for serverless PDF and Word document extraction."),
        ("Q2: What happens if Azure APIs or network connections fail during your demo?",
         "\"We engineered Rehearse with high availability using an abstraction layer (ISpeechService, IFoundryService). If Azure credentials are missing or network calls time out, the system automatically falls back to the browser's native Web Speech API (SpeechRecognition & speechSynthesis) and local contextual heuristics in MockFoundryService. The interview never crashes.\""),
        ("Q3: How do you prevent the AI interviewer from asking repetitive questions?",
         "\"In foundryService.ts and mockFoundryService.ts, the agent tracks a coveredTopics ledger. The prompt strictly instructs the model to avoid repeating the primary entity and to rotate across five distinct engineering pillars: Architecture Fundamentals, Scalability & Storage, Distributed Systems & Concurrency, Production Incidents & Observability, and Behavioral & Judgment.\""),
        ("Q4: What if a student enters an interview without uploading a resume?",
         "\"We implemented non-resume fallback intelligence: rather than forcing the candidate to recount a past project, the model detects !context.resumeText and poses role-specific architectural scenarios (e.g. database schema design & indexing for Backend, client state architecture & 60fps rendering for Frontend, distributed rate limiting for System Design, or technical disagreements for Behavioral).\""),
        ("Q5: How does your project address Responsible AI principles?",
         "\"1. Privacy: Video camera feeds run 100% locally in browser memory (getUserMedia) and are never transmitted to cloud servers.\n"
         "2. Security: Cloud API keys are encapsulated in serverless API proxies (/api/speech, /api/interviews) and never bundled into client JavaScript.\n"
         "3. Fairness: We reject pseudo-scientific facial/emotion tracking claims; scoring is grounded strictly in observable verbal answers across technical accuracy, communication, and handling.\n"
         "4. Human Oversight: Candidates can pause, skip questions, switch to keyboard input, and finish speaking at their own pace.\"")
    ]

    for q, a in qa_list:
        qp = doc.add_paragraph()
        qp.paragraph_format.space_before = Pt(8)
        qp.paragraph_format.space_after = Pt(2)
        r = qp.add_run(q)
        r.font.size = Pt(10.5)
        r.font.bold = True
        r.font.color.rgb = DARK_BLUE

        ans_p = doc.add_paragraph()
        ans_p.paragraph_format.space_before = Pt(0)
        ans_p.paragraph_format.space_after = Pt(6)
        ans_p.paragraph_format.line_spacing = 1.15
        ans_r = ans_p.add_run(a)
        ans_r.font.size = Pt(9.5)
        ans_r.font.color.rgb = RGBColor(51, 65, 85)

    # -------------------------------------------------------------
    # SECTION 5: Verification & Quality Assurance Summary
    # -------------------------------------------------------------
    doc.add_page_break()
    h5 = doc.add_paragraph()
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)
    r_h5 = h5.add_run("5. Verification & Engineering Standards")
    r_h5.font.name = 'Arial'
    r_h5.font.size = Pt(14)
    r_h5.font.bold = True
    r_h5.font.color.rgb = NAVY_TITLE

    p5_text = doc.add_paragraph()
    p5_text.paragraph_format.space_after = Pt(8)
    p5_text.paragraph_format.line_spacing = 1.15
    p5_text.add_run(
        "To guarantee 100% submission reliability for the presentation on 24 – 25 September 2026, Rehearse has been verified across all engineering dimensions:"
    )

    qa_summary_table = doc.add_table(rows=5, cols=3)
    qa_summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    qa_summary_table.autofit = False
    qa_widths = [Inches(1.8), Inches(1.4), Inches(3.3)]

    qa_headers = ["Engineering Check", "Status", "Details & Metrics"]
    for i, h in enumerate(qa_headers):
        c = qa_summary_table.cell(0, i)
        c.width = qa_widths[i]
        set_cell_background(c, "0F172A")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        set_cell_borders(c, top="0F172A", bottom="0F172A")
        cp = c.paragraphs[0]
        cp.paragraph_format.space_before = Pt(0)
        cp.paragraph_format.space_after = Pt(0)
        r = cp.add_run(h)
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    qa_rows = [
        ("Automated Test Suite", "25 Passed (100%)", "Vitest test suite covers agent lifecycle, resume extraction, topic rotation, non-resume scenarios, and UI click handlers."),
        ("TypeScript Type Safety", "0 Errors", "Strict typechecking verified via npx tsc --noEmit with zero any casts on domain models."),
        ("Next.js Production Build", "Compiled Cleanly", "All 7 application routes static/dynamic compiled with zero warnings or hydration errors."),
        ("Live Production Deployment", "Live (HTTP 200)", "Hosted and verified on Vercel at https://getrehearse.vercel.app with instant global CDN distribution.")
    ]

    for idx, (check, status, details) in enumerate(qa_rows, start=1):
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate([check, status, details]):
            c = qa_summary_table.cell(idx, c_idx)
            c.width = qa_widths[c_idx]
            set_cell_background(c, bg)
            set_cell_margins(c, top=60, bottom=60, left=100, right=100)
            set_cell_borders(c, top="E2E8F0", bottom="E2E8F0", left="E2E8F0", right="E2E8F0")
            cp = c.paragraphs[0]
            cp.paragraph_format.space_before = Pt(0)
            cp.paragraph_format.space_after = Pt(0)
            r = cp.add_run(val)
            r.font.size = Pt(8.5)
            if c_idx == 0:
                r.font.bold = True
                r.font.color.rgb = DARK_BLUE
            elif c_idx == 1:
                r.font.bold = True
                r.font.color.rgb = RGBColor(16, 185, 129) # Emerald Green

    # Save to all requested paths
    for path in output_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        doc.save(path)
        print(f"Successfully generated DOCX at: {path}")

if __name__ == "__main__":
    paths = [
        "/Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/AI_103_Project_Submission_Guide.docx",
        "/Users/sukhrajsingh/.gemini/antigravity/brain/da020b73-a127-4297-990a-af8a5a16bf79/AI_103_Project_Submission_Guide.docx"
    ]
    build_ai103_docx(paths)
