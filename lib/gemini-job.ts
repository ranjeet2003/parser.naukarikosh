import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function convertJobHtmlToJson(htmlContent: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Convert the following HTML content from a job description page into a structured JSON object.

The JSON object should have the following structure:
- "jobTitle": The main title of the job.
- "postDate": The date when the job was posted.
- "applicationDeadline": The last date to apply.
- "organization": The name of the organization hiring.
- "vacancies": Total number of vacancies.
- "jobDescription": A brief summary of the job.
- "eligibility": An object containing:
  - "ageLimit": An object with "minimum" and "maximum" age.
  - "education": The required educational qualifications.
- "applicationFee": An object with fees for different categories (e.g., "general", "sc_st").
- "importantLinks": An array of objects, where each object has "title" and "link".

Extract the information from the HTML and format it into the JSON structure. If some information is not available, the corresponding field can be null.

The final output must be ONLY a valid JSON object, with no extra text, comments, or markdown.

HTML:
${htmlContent}

JSON:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    } else {
      return JSON.parse(text);
    }
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    throw new Error('Failed to convert HTML to JSON using Gemini AI. Please check your API key and try again.');
  }
}


