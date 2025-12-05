import OpenAI from 'openai';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateScienceLessonContent(chapterTitle: string, lessonTitle: string): Promise<{
  notes: string;
  examples: string[];
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}> {
  const prompt = `Create comprehensive Grade 7 science lesson content for:
Chapter: ${chapterTitle}
Lesson: ${lessonTitle}

Generate content that includes:
1. Detailed notes (500-800 words) explaining the topic in student-friendly language
2. 3-4 practical examples or experiments students can understand
3. 10 multiple choice questions with 4 options each, correct answer, and explanations

Make sure the content is:
- Age-appropriate for 12-13 year old students
- Clear and engaging
- Scientifically accurate
- Includes real-world applications
- Uses simple vocabulary while maintaining scientific precision

Respond in JSON format with this structure:
{
  "notes": "detailed explanation text",
  "examples": ["example 1", "example 2", "example 3"],
  "questions": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "option A",
      "explanation": "why this is correct"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 4000
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');
    return content;
  } catch (error) {
    console.error('Error generating lesson content:', error);
    throw new Error('Failed to generate lesson content');
  }
}

export async function generateScienceLessonsForChapter(chapterTitle: string, chapterDescription: string): Promise<Array<{
  title: string;
  notes: string;
  examples: string[];
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}>> {
  const prompt = `Create 3-4 comprehensive Grade 7 science lessons for the chapter:
Chapter: ${chapterTitle}
Description: ${chapterDescription}

For each lesson, generate:
1. A clear lesson title that builds progressively on the chapter topic
2. Detailed notes (400-600 words each) explaining concepts in student-friendly language
3. 3-4 practical examples or experiments
4. 10 multiple choice questions with 4 options each, correct answer, and detailed explanations

Make lessons progressive - each should build on the previous one.

Respond in JSON format:
{
  "lessons": [
    {
      "title": "lesson title",
      "notes": "detailed explanation",
      "examples": ["example 1", "example 2", "example 3"],
      "questions": [
        {
          "question": "question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "explanation"
        }
      ]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 4000
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');
    return content.lessons || [];
  } catch (error) {
    console.error('Error generating chapter lessons:', error);
    throw new Error('Failed to generate chapter lessons');
  }
}

export async function generateChineseLessonsForChapter(chapterTitle: string, chapterDescription: string): Promise<Array<{
  title: string;
  notes: string;
  examples: string[];
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}>> {
  const prompt = `Create 3-4 comprehensive Grade 7 Chinese language lessons for the chapter:
Chapter: ${chapterTitle}
Description: ${chapterDescription}

For each lesson, generate:
1. A clear lesson title that builds progressively on the chapter topic
2. Detailed notes (500-700 words each) explaining Chinese language concepts in student-friendly English
3. 3-4 practical examples with Chinese characters, pinyin pronunciation, and English meanings
4. 10 multiple choice questions with 4 options each, correct answer, and detailed explanations

Make content appropriate for beginner Chinese learners aged 12-13:
- Include pinyin (pronunciation guides) for all Chinese characters
- Use simplified Chinese characters
- Explain cultural context where relevant
- Focus on practical, everyday Chinese usage
- Include stroke order information for character lessons
- Make lessons progressive - each should build on the previous one

For character-based lessons, include:
- Character meanings and etymology when helpful
- Stroke order basics
- Common usage in words and sentences

For pronunciation lessons, include:
- Tone explanations (1st, 2nd, 3rd, 4th tone)
- Similar sounds in English where possible
- Common pronunciation mistakes to avoid

For grammar lessons, include:
- Clear explanation of Chinese sentence structure
- Comparison with English grammar where helpful
- Common patterns and usage

Respond in JSON format:
{
  "lessons": [
    {
      "title": "lesson title",
      "notes": "detailed explanation with Chinese characters, pinyin, and English meanings",
      "examples": ["Example 1: 你好 (nǐ hǎo) - Hello", "Example 2: 谢谢 (xiè xiè) - Thank you", "Example 3: 再见 (zài jiàn) - Goodbye"],
      "questions": [
        {
          "question": "What does 你好 (nǐ hǎo) mean?",
          "options": ["Goodbye", "Hello", "Thank you", "Please"],
          "correctAnswer": "Hello",
          "explanation": "你好 (nǐ hǎo) is the most common way to say 'Hello' in Chinese. 你 (nǐ) means 'you' and 好 (hǎo) means 'good'."
        }
      ]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 4000
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');
    return content.lessons || [];
  } catch (error) {
    console.error('Error generating Chinese chapter lessons:', error);
    throw new Error('Failed to generate Chinese chapter lessons');
  }
}