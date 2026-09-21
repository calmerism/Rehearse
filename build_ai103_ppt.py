import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_presentation(output_paths):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide

    # Color Palette
    BG_DARK = RGBColor(15, 23, 42)       # Slate 900
    BG_LIGHT = RGBColor(248, 250, 252)   # Slate 50
    CARD_BG = RGBColor(255, 255, 255)    # White
    CARD_BORDER = RGBColor(226, 232, 240) # Slate 200
    TEXT_PRIMARY = RGBColor(15, 23, 42)  # Slate 900
    TEXT_SECONDARY = RGBColor(100, 116, 139) # Slate 500
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400
    ACCENT_RED = RGBColor(208, 82, 54)   # #D05236 Terracotta
    ACCENT_GREEN = RGBColor(16, 185, 129) # Emerald 500
    ACCENT_BLUE = RGBColor(2, 132, 199)  # Sky 600
    CARD_BG_TINT = RGBColor(241, 245, 249) # Slate 100

    def add_header(slide, tag, title, subtitle=None):
        # Tag
        tb_tag = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_tag = tb_tag.text_frame
        tf_tag.word_wrap = True
        tf_tag.margin_left = tf_tag.margin_top = tf_tag.margin_right = tf_tag.margin_bottom = 0
        p_tag = tf_tag.paragraphs[0]
        r_tag = p_tag.add_run()
        r_tag.text = tag.upper()
        r_tag.font.name = "Arial"
        r_tag.font.size = Pt(10)
        r_tag.font.bold = True
        r_tag.font.color.rgb = ACCENT_RED

        # Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(0.7))
        tf_title = tb_title.text_frame
        tf_title.word_wrap = True
        tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
        p_title = tf_title.paragraphs[0]
        r_title = p_title.add_run()
        r_title.text = title
        r_title.font.name = "Arial"
        r_title.font.size = Pt(22)
        r_title.font.bold = True
        r_title.font.color.rgb = TEXT_PRIMARY

        # Subtitle (optional)
        if subtitle:
            tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(11.7), Inches(0.4))
            tf_sub = tb_sub.text_frame
            tf_sub.word_wrap = True
            tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
            p_sub = tf_sub.paragraphs[0]
            r_sub = p_sub.add_run()
            r_sub.text = subtitle
            r_sub.font.name = "Arial"
            r_sub.font.size = Pt(12)
            r_sub.font.color.rgb = TEXT_SECONDARY

    def set_slide_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background() # No line
        # Send to back
        slide.shapes._spTree.remove(bg._element)
        slide.shapes._spTree.insert(2, bg._element)

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: Title Slide (Dark Theme)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, BG_DARK)

    # Subtitle Badge
    b1 = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.9), Inches(0.4))
    tf1 = b1.text_frame
    p = tf1.paragraphs[0]
    r = p.add_run()
    r.text = "CHITKARA UNIVERSITY | INBIOT | AZURE AI-103 FINAL PROJECT"
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = ACCENT_RED

    # Main Title
    b2 = s1.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(10.9), Inches(1.2))
    tf2 = b2.text_frame
    p = tf2.paragraphs[0]
    r = p.add_run()
    r.text = "Rehearse"
    r.font.name = "Arial"
    r.font.size = Pt(56)
    r.font.bold = True
    r.font.color.rgb = RGBColor(255, 255, 255)

    # Tagline
    b3 = s1.shapes.add_textbox(Inches(1.2), Inches(3.3), Inches(10.9), Inches(0.8))
    tf3 = b3.text_frame
    p = tf3.paragraphs[0]
    r = p.add_run()
    r.text = "Autonomous, Real-Time AI Interview Coach\n\"Practice the interview, not just the questions.\""
    r.font.name = "Arial"
    r.font.size = Pt(20)
    r.font.color.rgb = RGBColor(203, 213, 225) # Slate 300

    # Metadata Strip Cards
    meta_items = [
        ("Live Web Application", "getrehearse.vercel.app"),
        ("Evaluation Dates", "24 – 25 September 2026"),
        ("AI-103 Capabilities", "Speech, Foundry, Agent, Docs"),
        ("Automated Tests", "25 Passed (100% Type-Safe)")
    ]
    for idx, (label, val) in enumerate(meta_items):
        card_w = Inches(2.5)
        card_l = Inches(1.2) + idx * Inches(2.8)
        card = add_card(s1, card_l, Inches(5.2), card_w, Inches(1.3), bg_color=RGBColor(30, 41, 59), border_color=RGBColor(51, 65, 85))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.2)
        tf.margin_top = Inches(0.2)
        
        p0 = tf.paragraphs[0]
        r0 = p0.add_run()
        r0.text = label.upper()
        r0.font.name = "Arial"
        r0.font.size = Pt(9)
        r0.font.bold = True
        r0.font.color.rgb = ACCENT_RED
        
        p1 = tf.add_paragraph()
        p1.space_before = Pt(4)
        r1 = p1.add_run()
        r1.text = val
        r1.font.name = "Arial"
        r1.font.size = Pt(13)
        r1.font.bold = True
        r1.font.color.rgb = RGBColor(255, 255, 255)

    # =========================================================================
    # SLIDE 2: Problem Statement (30 sec)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, BG_LIGHT)
    add_header(s2, "30-Second Problem Statement", "The Placement Interview Preparation Gap", "Why conventional interview preparation leaves engineering candidates unprepared for live interviews.")

    prob_cards = [
        ("1. Passive Rote Memorization",
         "Students solve isolated LeetCode algorithms and memorize text definitions from flashcards.\n\nWhile this builds syntax memory, it completely neglects the verbal articulation and technical defense skills required in live engineering conversations.",
         ACCENT_RED),
        ("2. Zero Conversational Scrutiny",
         "Mock tests and questionnaires are static and non-adaptive.\n\nThey never challenge candidates when an answer is shallow, never probe missing trade-offs, and never test how a candidate responds to unexpected interruptions.",
         ACCENT_BLUE),
        ("3. The Live Interview Freeze",
         "In real placement interviews, senior interviewers ask:\n\"Why PostgreSQL over MongoDB? What breaks if traffic spikes 100x?\"\n\nCandidates frequently flounder under pressure because they have never rehearsed live verbal defense against senior scrutiny.",
         TEXT_PRIMARY)
    ]

    for idx, (head, body, acc_col) in enumerate(prob_cards):
        c_left = Inches(0.8) + idx * Inches(4.0)
        card = add_card(s2, c_left, Inches(2.0), Inches(3.7), Inches(4.6))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.35)

        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = head
        r.font.name = "Arial"
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = acc_col

        p_body = tf.add_paragraph()
        p_body.space_before = Pt(14)
        p_body.line_spacing = 1.25
        r_b = p_body.add_run()
        r_b.text = body
        r_b.font.name = "Arial"
        r_b.font.size = Pt(12.5)
        r_b.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 3: AI-Driven Solution (1 min)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, BG_LIGHT)
    add_header(s3, "1-Minute Solution Overview", "Rehearse: An Active, Adaptive Interview Partner", "An autonomous conversational platform replacing static questionnaires with dynamic oral rehearsals.")

    sol_cards = [
        ("Conversational Neural Voice",
         "Replaces artificial chat interfaces with real-time spoken conversation. Speech-to-Text captures spoken answers, while 24kHz Neural TTS delivers natural, expressive interviewer audio.",
         "Speech Intelligence"),
        ("Dynamic Trade-Off Probing",
         "The AI extracts specific technical claims (database schemas, caching, concurrency) from candidate speech and generates spontaneous follow-up questions challenging system trade-offs.",
         "Generative Reasoning"),
        ("Duration Clock & Topic Rotation",
         "An autonomous state machine manages scheduled interview durations (10m, 20m, 30m) and rotates across 5 distinct engineering pillars to prevent repetitive questioning.",
         "Autonomous Agent"),
        ("Closed-Loop Deliberate Practice",
         "Upon completion, candidates receive 3-axis qualitative scoring (Technical, Communication, Handling). 'Rehearse Again' seeds diagnosed weaknesses directly into the next session prompt.",
         "Deliberate Practice")
    ]

    for idx, (title, desc, tag) in enumerate(sol_cards):
        col = idx % 2
        row = idx // 2
        c_left = Inches(0.8) + col * Inches(6.0)
        c_top = Inches(2.0) + row * Inches(2.4)
        card = add_card(s3, c_left, c_top, Inches(5.7), Inches(2.1))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.25)

        p = tf.paragraphs[0]
        r_tag = p.add_run()
        r_tag.text = tag.upper()
        r_tag.font.name = "Arial"
        r_tag.font.size = Pt(9)
        r_tag.font.bold = True
        r_tag.font.color.rgb = ACCENT_RED

        p_title = tf.add_paragraph()
        p_title.space_before = Pt(2)
        r_title = p_title.add_run()
        r_title.text = title
        r_title.font.name = "Arial"
        r_title.font.size = Pt(15)
        r_title.font.bold = True
        r_title.font.color.rgb = TEXT_PRIMARY

        p_desc = tf.add_paragraph()
        p_desc.space_before = Pt(6)
        p_desc.line_spacing = 1.2
        r_desc = p_desc.add_run()
        r_desc.text = desc
        r_desc.font.name = "Arial"
        r_desc.font.size = Pt(11.5)
        r_desc.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 4: Azure AI-103 Concepts Applied (25% Weight)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, BG_LIGHT)
    add_header(s4, "AI-103 Curriculum Mapping (25% Weight)", "Four Core Azure AI Capabilities Applied", "Demonstrating deep, production-grade integration of Microsoft Azure AI Services.")

    pillars = [
        ("1. Azure AI Speech Services",
         "• Continuous Speech-to-Text (STT) transcribes candidate voice in real time.\n• Neural Text-to-Speech (TTS) streams 24kHz 160kbps MP3 studio audio.\n• Expressive SSML prosody styling (<mstts:express-as style=\"chat\">) with natural interviewer voices (Jenny, Guy).",
         "Speech Services"),
        ("2. Microsoft Foundry / Azure OpenAI",
         "• GPT-4o model deployment powers real-time candidate reasoning.\n• Few-shot prompt grounding against candidate context and resume data.\n• Enforced structured JSON output schema ({ type: 'json_object' }) for questions, difficulty grading, and feedback.",
         "Generative AI"),
        ("3. Autonomous Interview Agent",
         "• Event-driven finite state machine (Idle ➔ Speaking ➔ Listening ➔ Thinking).\n• Meeting clock duration pacing (10m / 20m / 30m) with auto wrap-up.\n• 5-pillar topic rotation prevents repetitive inquiries and ensures breadth.",
         "Agent State Machine"),
        ("4. Document Intelligence Parser",
         "• Native serverless PDF (unpdf) & Word (mammoth) document text extraction.\n• Deep resume anchoring: targets genuine candidate projects and trade-offs.\n• Non-resume fallback: evaluates fundamental architecture scenarios.",
         "Document Ingestion")
    ]

    for idx, (title, points, tag) in enumerate(pillars):
        c_left = Inches(0.8) + idx * Inches(3.0)
        card = add_card(s4, c_left, Inches(2.0), Inches(2.8), Inches(4.7))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.25)

        p = tf.paragraphs[0]
        r_tag = p.add_run()
        r_tag.text = tag.upper()
        r_tag.font.name = "Arial"
        r_tag.font.size = Pt(8.5)
        r_tag.font.bold = True
        r_tag.font.color.rgb = ACCENT_RED

        p_t = tf.add_paragraph()
        p_t.space_before = Pt(4)
        r_t = p_t.add_run()
        r_t.text = title
        r_t.font.name = "Arial"
        r_t.font.size = Pt(13)
        r_t.font.bold = True
        r_t.font.color.rgb = TEXT_PRIMARY

        p_b = tf.add_paragraph()
        p_b.space_before = Pt(10)
        p_b.line_spacing = 1.2
        r_b = p_b.add_run()
        r_b.text = points
        r_b.font.name = "Arial"
        r_b.font.size = Pt(10)
        r_b.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 5: System Architecture & Data Flow
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, BG_LIGHT)
    add_header(s5, "System Architecture", "End-to-End Multi-Tier Engineering Pipeline", "Clean architectural separation from client audio capture to Azure Cloud AI and local fallbacks.")

    tiers = [
        ("Client Tier (Browser)",
         "• Apple Human Interface Design (Zero visual slop)\n• HTML5 MediaStream Local Video Preview (100% Private)\n• Real-Time Microphone Web Audio API Level Meter\n• AudioContext Pre-Warmed Neural MP3 Player",
         ACCENT_BLUE),
        ("Application Tier (Next.js 14)",
         "• Serverless API Proxy Routes (/api/speech, /api/interviews)\n• Autonomous Agent State Machine (InterviewAgent.ts)\n• Duration Clock Pacing & Topic Rotation Ledger\n• Client-side Encrypted LocalStorage Session Store",
         ACCENT_RED),
        ("Azure Cloud Tier (AI-103)",
         "• Azure AI Speech: Continuous STT & 24kHz Studio TTS\n• Microsoft Foundry: GPT-4o Chat Completions\n• Structured JSON Schema Response Enforcement\n• SSML Expressive Conversational Prosody",
         TEXT_PRIMARY),
        ("Resilience Tier (Fallback)",
         "• Browser Web Speech API (SpeechRecognition & SpeechSynthesis)\n• Context-Aware Mock Foundry Heuristics Engine\n• Zero-crash offline functionality guaranteed\n• Seamless failover during network timeouts",
         ACCENT_GREEN)
    ]

    for idx, (title, desc, col) in enumerate(tiers):
        col_idx = idx % 2
        row_idx = idx // 2
        c_left = Inches(0.8) + col_idx * Inches(6.0)
        c_top = Inches(2.0) + row_idx * Inches(2.4)
        card = add_card(s5, c_left, c_top, Inches(5.7), Inches(2.1))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.2)

        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        r.font.name = "Arial"
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = col

        p_desc = tf.add_paragraph()
        p_desc.space_before = Pt(8)
        p_desc.line_spacing = 1.25
        r_desc = p_desc.add_run()
        r_desc.text = desc
        r_desc.font.name = "Arial"
        r_desc.font.size = Pt(11)
        r_desc.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 6: Live Demonstration Workflow (2 min)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, BG_LIGHT)
    add_header(s6, "2-Minute Technical Demo Flow", "Live Rehearsal Lifecycle on getrehearse.vercel.app", "The exact sequence to follow during your live classroom demonstration on 24 – 25 September.")

    steps = [
        ("Step 1: Setup & Grounding",
         "Select Software Engineer, Technical format, 10 min. Click '+ Load Sample Resume' (Alex Chen: React, Node, PostgreSQL). Credentials immediately extracted.",
         "15 sec"),
        ("Step 2: Lobby Calibration",
         "Observe live microphone audio check meter and preview interviewer's studio neural voice. Video runs 100% locally. Click 'Start Interview'.",
         "15 sec"),
        ("Step 3: Opening & Spoken Answer",
         "AI speaks resume-grounded question on technical decisions. Candidate speaks into mic: 'I built an order service using Node & PostgreSQL with relational transactions.'",
         "30 sec"),
        ("Step 4: Adaptive Scrutiny",
         "AI transitions to Thinking and adapts: 'Why PostgreSQL over NoSQL like MongoDB?' Candidate answers with ACID guarantees. AI deepens to 100x scaling.",
         "30 sec"),
        ("Step 5: Feedback & Rehearse Again",
         "Meeting clock auto-concludes cleanly. Show 3-axis qualitative report. Click 'Rehearse Again' to pre-seed the diagnosed weakness into the next prompt.",
         "30 sec")
    ]

    for idx, (title, desc, duration) in enumerate(steps):
        c_left = Inches(0.8) + idx * Inches(2.4)
        card = add_card(s6, c_left, Inches(2.0), Inches(2.25), Inches(4.7))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.18)
        tf.margin_top = Inches(0.2)

        p = tf.paragraphs[0]
        r_dur = p.add_run()
        r_dur.text = duration.upper()
        r_dur.font.name = "Arial"
        r_dur.font.size = Pt(9)
        r_dur.font.bold = True
        r_dur.font.color.rgb = ACCENT_RED

        p_t = tf.add_paragraph()
        p_t.space_before = Pt(4)
        r_t = p_t.add_run()
        r_t.text = title
        r_t.font.name = "Arial"
        r_t.font.size = Pt(12)
        r_t.font.bold = True
        r_t.font.color.rgb = TEXT_PRIMARY

        p_b = tf.add_paragraph()
        p_b.space_before = Pt(8)
        p_b.line_spacing = 1.2
        r_b = p_b.add_run()
        r_b.text = desc
        r_b.font.name = "Arial"
        r_b.font.size = Pt(10)
        r_b.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 7: Testing, Reliability & Responsible AI (15% Weight)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7, BG_LIGHT)
    add_header(s7, "Testing, Reliability & Responsible AI (15% Weight)", "Engineering Rigor, Fault Tolerance & Ethical AI", "Strict adherence to Slide 6 guidelines on code quality, testing, and responsible deployment.")

    rigor_cards = [
        ("Automated Test Suite (25 Tests)",
         "• 25 automated unit & integration tests passing (npm test).\n• Covers resume grounding, non-resume scenarios, agent FSM, dynamic follow-ups, topic rotation, and UI button clicks.\n• Strict TypeScript compilation: 0 errors on npx tsc --noEmit.\n• Next.js 14 production build verified with zero hydration warnings.",
         ACCENT_GREEN),
        ("Fault Tolerance & Offline Fallback",
         "• Dual-Layer Service Abstraction (ISpeechService, IFoundryService).\n• If Azure credentials are absent or network requests time out, the system automatically falls back to browser Web Speech & local heuristics.\n• Race-condition-proof audio singleton eliminates stutter, overlapping speech, and memory leaks on navigation.",
         ACCENT_BLUE),
        ("Responsible AI Principles",
         "• Privacy: Camera video runs 100% locally in browser memory (getUserMedia); zero frames uploaded to servers.\n• Security: Azure API keys protected in serverless environment variables; never bundled into client JS.\n• Fairness: Rejects pseudo-scientific emotion tracking; evaluates solely on objective technical criteria.\n• Human Agency: Candidate controls duration, text input, and pacing.",
         ACCENT_RED)
    ]

    for idx, (title, body, col) in enumerate(rigor_cards):
        c_left = Inches(0.8) + idx * Inches(4.0)
        card = add_card(s7, c_left, Inches(2.0), Inches(3.7), Inches(4.6))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.3)

        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        r.font.name = "Arial"
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = col

        p_b = tf.add_paragraph()
        p_b.space_before = Pt(12)
        p_b.line_spacing = 1.25
        r_b = p_b.add_run()
        r_b.text = body
        r_b.font.name = "Arial"
        r_b.font.size = Pt(11)
        r_b.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 8: Official Rubric Compliance (100% Checklist)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8, BG_LIGHT)
    add_header(s8, "Slide 5 Evaluation Rubric", "100% Evaluation Criteria Compliance", "How Rehearse directly satisfies each weighted grading area from the instructor's rubric.")

    # Create Table on Slide
    table_shape = s8.shapes.add_table(8, 4, Inches(0.8), Inches(1.9), Inches(11.7), Inches(4.8))
    tbl = table_shape.table
    tbl.columns[0].width = Inches(2.8)
    tbl.columns[1].width = Inches(1.1)
    tbl.columns[2].width = Inches(5.8)
    tbl.columns[3].width = Inches(2.0)

    headers = ["Evaluation Area", "Weight", "Rehearse Compliance & Implementation", "Status"]
    for i, h in enumerate(headers):
        cell = tbl.cell(0, i)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BG_DARK
        tf = cell.text_frame
        tf.margin_left = tf.margin_right = Inches(0.12)
        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = h
        r.font.name = "Arial"
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    rubric_items = [
        ("Application of AI-103 concepts", "25%", "Azure Speech (STT/TTS 24kHz SSML), Microsoft Foundry GPT-4o, Autonomous Agent FSM, Document Parser.", "Verified (Full Marks)"),
        ("Technical implementation & functionality", "25%", "Production Next.js 14 web app, live on Vercel at getrehearse.vercel.app, zero runtime errors.", "Live & Operational"),
        ("Testing, reliability and responsible AI", "15%", "25 unit tests passing, offline Web Speech fallback, local video privacy, serverless secret protection.", "100% Passing"),
        ("Problem definition and use-case relevance", "10%", "Solves student interview freeze by enabling live verbal defense of architectural trade-offs.", "Demonstrated"),
        ("Documentation and code quality", "10%", "Clean modular code, strict naming conventions, inline docstrings, complete specifications.", "Complete & Typed"),
        ("Demonstration and presentation", "10%", "Calibrated 5-minute timed presentation script matching Slide 3 time brackets to the second.", "Ready for Class"),
        ("Practical impact and future scope", "5%", "Deliberate practice loop boosts placement success; clear regional language and PDF roadmap.", "Documented")
    ]

    for row_idx, (area, weight, comp, stat) in enumerate(rubric_items, start=1):
        bg_col = CARD_BG_TINT if row_idx % 2 == 1 else CARD_BG
        for col_idx, val in enumerate([area, weight, comp, stat]):
            cell = tbl.cell(row_idx, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg_col
            tf = cell.text_frame
            tf.margin_left = tf.margin_right = Inches(0.1)
            p = tf.paragraphs[0]
            r = p.add_run()
            r.text = val
            r.font.name = "Arial"
            r.font.size = Pt(9.5)
            if col_idx == 0:
                r.font.bold = True
                r.font.color.rgb = TEXT_PRIMARY
            elif col_idx == 1:
                r.font.bold = True
                r.font.color.rgb = ACCENT_RED
            elif col_idx == 3:
                r.font.bold = True
                r.font.color.rgb = ACCENT_GREEN
            else:
                r.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 9: Practical Impact, Limitations & Future Scope (5% Weight)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9, BG_LIGHT)
    add_header(s9, "Impact, Limitations & Roadmap (5% Weight)", "Measurable Placement Value & Scalability", "Demonstrating real-world educational impact and clear technological evolution.")

    imp_cards = [
        ("Practical Educational Impact",
         "• Deliberate Practice: Converts passive reading into active, high-pressure verbal muscle memory.\n\n• Higher Placement Conversion: Engineering graduates enter campus placement rounds confident in articulating system design trade-offs.\n\n• Objective Benchmarking: Diagnostic scoring provides calibrated feedback without requiring human mentors for every mock session.",
         ACCENT_GREEN),
        ("Current V1 Limitations",
         "• Focused Exclusively on Conversation: Intentionally excludes non-core ATS or job-board features to maximize interview rehearsal depth.\n\n• English-First Voice Models: Currently optimized for English neural accents (US, UK).\n\n• Audio Bandwidth: Full 24kHz studio streaming requires stable client internet (mitigated by native Web Speech fallback).",
         ACCENT_RED),
        ("Future Roadmap & Scaling",
         "• Regional Language Support: Ingesting multilingual Azure neural voices for regional mock interviews in Hindi, Punjabi, and Tamil.\n\n• Placement Cell Integration: Exportable PDF diagnostic coaching reports for university career mentors.\n\n• Sub-Discipline Fine-Tuning: Custom prompt weights for emerging tracks (DevOps, Site Reliability, and AI/ML Engineering).",
         ACCENT_BLUE)
    ]

    for idx, (title, body, col) in enumerate(imp_cards):
        c_left = Inches(0.8) + idx * Inches(4.0)
        card = add_card(s9, c_left, Inches(2.0), Inches(3.7), Inches(4.6))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.3)

        p = tf.paragraphs[0]
        r = p.add_run()
        r.text = title
        r.font.name = "Arial"
        r.font.size = Pt(15)
        r.font.bold = True
        r.font.color.rgb = col

        p_b = tf.add_paragraph()
        p_b.space_before = Pt(12)
        p_b.line_spacing = 1.25
        r_b = p_b.add_run()
        r_b.text = body
        r_b.font.name = "Arial"
        r_b.font.size = Pt(11)
        r_b.font.color.rgb = TEXT_SECONDARY

    # =========================================================================
    # SLIDE 10: Conclusion & Viva Q&A Defense (Dark Theme)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10, BG_DARK)

    b_end = s10.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(10.9), Inches(0.4))
    tf_end = b_end.text_frame
    p = tf_end.paragraphs[0]
    r = p.add_run()
    r.text = "CONCLUSION & VIVA DEFENSE"
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = ACCENT_RED

    b_t = s10.shapes.add_textbox(Inches(1.2), Inches(1.9), Inches(10.9), Inches(1.0))
    tf_t = b_t.text_frame
    p = tf_t.paragraphs[0]
    r = p.add_run()
    r.text = "Thank You. We Welcome Your Questions."
    r.font.name = "Arial"
    r.font.size = Pt(40)
    r.font.bold = True
    r.font.color.rgb = RGBColor(255, 255, 255)

    viva_cards = [
        ("Production Web App", "getrehearse.vercel.app\n• Live on global CDN\n• Zero-config onboarding\n• Mobile & desktop responsive"),
        ("Key Architecture Highlights", "• Azure Speech 24kHz SSML\n• Foundry GPT-4o JSON Schema\n• FSM Duration Clock Pacing\n• Dual-layer Offline Fallback"),
        ("Viva Defense Readiness", "• 100% code explainability\n• Privacy & security verified\n• 25 automated tests passing\n• 0 TypeScript compilation errors")
    ]

    for idx, (title, desc) in enumerate(viva_cards):
        c_left = Inches(1.2) + idx * Inches(3.8)
        card = add_card(s10, c_left, Inches(3.4), Inches(3.4), Inches(2.8), bg_color=RGBColor(30, 41, 59), border_color=RGBColor(51, 65, 85))
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.25)
        tf.margin_top = Inches(0.25)

        p0 = tf.paragraphs[0]
        r0 = p0.add_run()
        r0.text = title
        r0.font.name = "Arial"
        r0.font.size = Pt(14)
        r0.font.bold = True
        r0.font.color.rgb = ACCENT_RED

        p1 = tf.add_paragraph()
        p1.space_before = Pt(8)
        p1.line_spacing = 1.25
        r1 = p1.add_run()
        r1.text = desc
        r1.font.name = "Arial"
        r1.font.size = Pt(11)
        r1.font.color.rgb = RGBColor(226, 232, 240) # Slate 200

    # Save to all requested paths
    for path in output_paths:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        prs.save(path)
        print(f"Successfully generated PowerPoint presentation at: {path}")

if __name__ == "__main__":
    paths = [
        "/Users/sukhrajsingh/Documents/antigravity/adventurous-brahmagupta/AI_103_Final_Presentation_Rehearse.pptx",
        "/Users/sukhrajsingh/.gemini/antigravity/brain/da020b73-a127-4297-990a-af8a5a16bf79/AI_103_Final_Presentation_Rehearse.pptx"
    ]
    create_presentation(paths)
