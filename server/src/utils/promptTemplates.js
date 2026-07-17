// Builds the system + user prompt for each mode Goose (the AI Study Assistant) supports.
// Every JSON mode asks the model to return strict JSON so the frontend can render it reliably.
// Every system prompt shares the same accuracy rules: be correct, be honest about uncertainty,
// never invent facts, numbers, or citations. Goose answers both students and faculty.

const ACCURACY_RULES = `
You are Goose, the AI assistant inside StudySphere AI. You help both students and faculty.
Follow these rules strictly on every answer:
- Be factually correct. If you are not confident about a specific fact, date, number, or name, say so plainly rather than guessing.
- Never invent statistics, quotes, citations, or sources.
- Match your explanation to the student's likely level based on the topic and any exam target given — clear and precise, not padded with filler.
- If a question is ambiguous, answer the most reasonable interpretation and briefly note the assumption.
- Keep tone encouraging and clear, like a good tutor, not a generic search result.
- If asked who you are, say you're Goose, StudySphere AI's assistant.
- Be concise. Every field should be as short as it can be while staying correct and useful — this is not a place for long-winded prose. Short, direct sentences generate faster and are less likely to get cut off.
`;

function buildPrompt(mode, { topic, text, difficulty, count, examTarget, language, marksScheme, totalMarks, examType, quizResults }) {
  const source = text
    ? `Base your answer on this source material:\n"""${text.slice(0, 6000)}"""`
    : `Topic: "${topic}"`;
  const examLine = examTarget ? `\nExam/context target: ${examTarget}. Tailor depth and examples accordingly.` : "";
  const langLine = language && language !== "en" ? `\nRespond entirely in this language: ${language}.` : "";

  switch (mode) {
    case "explain":
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble.`,
        user: `${source}${examLine}${langLine}

Return JSON with this exact shape:
{
  "explanation": "clear, beginner-friendly explanation (3-5 paragraphs)",
  "keyPoints": ["point1", "point2", "..."],
  "summary": "2-3 sentence summary",
  "examples": ["example1", "example2"],
  "realWorldApplications": ["application1", "application2"]
}`,
      };

    case "notes":
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble.`,
        user: `${source}${examLine}${langLine}

Return JSON with this exact shape:
{
  "shortNotes": ["concise bullet 1", "concise bullet 2", "..."],
  "detailedNotes": "well-structured detailed notes as a single string with paragraphs separated by \\n\\n",
  "examNotes": ["high-yield point for exams 1", "..."],
  "revisionNotes": ["quick revision bullet 1", "..."]
}`,
      };

    case "flashcards": {
      const n = count || 10;
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble.`,
        user: `${source}${examLine}${langLine}

Generate exactly ${n} flashcards. Every answer must be factually correct and unambiguous. Return JSON with this exact shape:
{
  "flashcards": [
    { "question": "...", "answer": "...", "memoryTip": "short mnemonic or memory trick" }
  ]
}`,
      };
    }

    case "mcq": {
      const n = count || 10;
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble. Every question must have exactly one unambiguously correct option.`,
        user: `${source}${examLine}${langLine}

Generate exactly ${n} multiple choice questions at ${difficulty || "intermediate"} difficulty. Return JSON with this exact shape:
{
  "questions": [
    {
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctOption": "A",
      "explanation": "why this is correct, one sentence"
    }
  ]
}`,
      };
    }

    case "quiz": {
      const n = count || 10;
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble. Every question must have exactly one unambiguously correct option.`,
        user: `${source}${examLine}${langLine}

Generate a ${difficulty || "beginner"} level quiz with exactly ${n} questions. Return JSON with this exact shape:
{
  "questions": [
    {
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctOption": "A"
    }
  ]
}`,
      };
    }

    // Generates a full marks-weighted question paper (e.g. 2/4/8/16-mark sections) from a
    // topic or uploaded PDF, similar to a real exam paper structure.
    case "exam_paper": {
      const scheme = marksScheme || "2, 4, 8, and 16 mark questions, roughly balanced";
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble. This is a written-answer exam paper, not multiple choice.`,
        user: `${source}${examLine}${langLine}

Create a written exam question paper worth a total of ${totalMarks || 50} marks, using a mix of: ${scheme}.
Group questions into sections by mark value. Each question should be a clear, answerable written-response
question (short answer for low marks, essay/problem-solving for high marks), not multiple choice.

Return JSON with this exact shape:
{
  "totalMarks": ${totalMarks || 50},
  "sections": [
    {
      "marksPerQuestion": 2,
      "instructions": "Answer briefly in 2-3 sentences.",
      "questions": ["question text", "..."]
    }
  ]
}`,
      };
    }

    // Generates an AI mock/practice test in the style of a named real-world exam
    // (company placement test or entrance exam). Always framed as AI-generated practice,
    // never presented as real leaked or official questions.
    case "mock_exam": {
      const n = count || 15;
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble. These are original AI-generated practice questions in the style of the named exam — never claim they are real official or leaked questions.`,
        user: `Create an AI-generated practice test in the style of "${examType}", covering the kind of topics and
difficulty that exam is known for. Generate exactly ${n} multiple choice questions (mix of aptitude/reasoning
and subject-specific questions as appropriate for this exam). Keep questions and options short and direct.
Return JSON with this exact shape:
{
  "examType": "${examType}",
  "disclaimer": "These are AI-generated practice questions inspired by the style of this exam, not real official or leaked questions.",
  "questions": [
    {
      "question": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctOption": "A"
    }
  ]
}`,
      };
    }

    // Generates a short, encouraging feedback paragraph after a quiz/exam attempt,
    // based on the actual results (not a template) — used for the "instant AI feedback" feature.
    case "quiz_feedback": {
      return {
        system: `${ACCURACY_RULES}\nRespond with plain text only (2-4 sentences), no JSON, no markdown headers.`,
        user: `A student just completed a quiz on "${topic}" and scored ${quizResults?.score}/${quizResults?.total}.
Here are the questions they got wrong (if any): ${JSON.stringify(quizResults?.wrongQuestions || [])}.
Write brief, encouraging, specific feedback: what they did well, what to review, and one concrete next step.${langLine}`,
      };
    }

    case "chat":
      return {
        system: `${ACCURACY_RULES}\nYou're chatting directly with a student or faculty member. Give clear, well-structured answers using plain text (simple markdown like bullet points is fine). Keep answers focused and not overly long unless asked for depth.${langLine}`,
        user: text,
      };

    // W3Schools-style structured lesson for the Courses reader — intro, explanation,
    // syntax/key points, and (for programming topics) a runnable starter example.
    case "tutorial": {
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble.`,
        user: `Topic: "${topic}"${examLine}${langLine}

Write a clear, structured tutorial lesson on this topic, the way a good textbook or W3Schools-style
page would. If this is a programming topic, include a small, correct, runnable code example.
Return JSON with this exact shape:
{
  "intro": "1-2 paragraph introduction to the topic",
  "sections": [
    { "heading": "section heading", "content": "explanation text for this section" }
  ],
  "keyPoints": ["key point 1", "..."],
  "isProgramming": true,
  "codeExample": {
    "language": "javascript",
    "code": "runnable example code, or empty string if not a programming topic",
    "explanation": "1-2 sentences on what the code does"
  }
}`,
      };
    }

    // Generates a full chapter list for a course/topic, the way a real course or a
    // W3Schools-style tutorial site would break a subject into chapters (e.g. "Java" ->
    // Introduction, Syntax, Data Types, Operators, Loops, Arrays, OOP, Exception Handling...).
    // The client fetches this once per course and shows it as the chapter sidebar, then loads
    // each chapter's actual lesson content lazily via the "tutorial" mode above.
    case "syllabus": {
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble.`,
        user: `Topic/course: "${topic}"${examLine}${langLine}

Break this into a full course curriculum, the way a structured course or a W3Schools-style tutorial
site organizes a subject into chapters — start from the fundamentals and progress to advanced
topics, in the logical order a learner should study them. If this is a programming language,
you MUST include chapters like: introduction/setup, syntax basics, variables & data types,
operators, control flow (if/else, switch), loops, functions/methods, arrays/collections, strings,
object-oriented programming (classes, objects, inheritance, polymorphism, encapsulation),
exception handling, and file/I-O handling — plus any other chapters specific to this language. If
this is a non-programming subject, cover its standard fundamental-to-advanced sub-topics the same
way a textbook's table of contents would. Include 12-18 chapters total.
Return JSON with this exact shape:
{
  "chapters": ["Introduction", "Chapter 2 title", "Chapter 3 title", "..."]
}`,
      };
    }


    case "coding_problem": {
      const n = count || 3;
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble.`,
        user: `Generate exactly ${n} coding problems on "${topic}" in ${language || "the relevant"} programming
language, at ${difficulty || "intermediate"} difficulty. Keep each "statement" under 40 words — short and
precise, not a long description. Return JSON with this exact shape:
{
  "problems": [
    {
      "title": "short problem title",
      "statement": "clear problem description",
      "starterCode": "minimal starter code/function signature in the target language",
      "sampleInput": "example input, if applicable",
      "sampleOutput": "expected output for the sample input"
    }
  ]
}`,
      };
    }

    // AI-reviews a student's submitted code (no execution — see README). Scores 0-100.
    case "coding_review": {
      return {
        system: `${ACCURACY_RULES}\nAlways respond with ONLY valid JSON, no markdown, no preamble. Judge correctness by careful reading/tracing of the code, not by running it.`,
        user: `Problem: "${topic}"
Student's submitted code (${language}):
"""
${text}
"""

Carefully review this code for correctness, edge cases, and style. Return JSON with this exact shape:
{
  "score": 85,
  "verdict": "correct" | "partially correct" | "incorrect",
  "feedback": "specific, constructive feedback — what's right, what's wrong, what to fix",
  "correctedCode": "a corrected/improved version, or empty string if already correct"
}`,
      };
    }

    default:
      throw new Error(`Unknown AI mode: ${mode}`);
  }
}

module.exports = { buildPrompt };
