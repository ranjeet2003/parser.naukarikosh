import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function convertHtmlToJson(htmlContent: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Convert the following HTML content into a comprehensive JSON object designed to build a Next.js landing page similar to a "sarkari result" website.

The JSON should be structured with the following top-level keys: "pageTitle", "header", "mainContent", "sidebar", and "footer".

1.  **pageTitle**: Extract the title of the HTML page.
2.  **header**: Identify the site logo (URL) and the main navigation links (text and href).
3.  **mainContent**: This should be an object containing arrays for the core content categories. For each category, extract a list of items, where each item is an object with details like "title", "link", "postDate", or "description". The categories are:
    - "results"
    - "admitCards"
    - "latestJobs"
    - "answerKeys"
    - "documents"
    - "admissions"
    - Any other distinct content boxes you identify.
4.  **sidebar**: Extract any secondary navigation or informational boxes, structured as an array of objects, where each object has a "title" and a list of "items" (with "text" and "link").
5.  **footer**: Capture footer links and any copyright text.

If a section (like a sidebar) is not present, its corresponding key should be an empty array or object.

The final output must be ONLY a valid JSON object, with no extra text, comments, or markdown.

HTML:
${htmlContent}

JSON:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the text as JSON. Gemini sometimes wraps JSON in markdown.
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    } else {
      // If not wrapped in markdown, try direct parse
      return JSON.parse(text);
    }
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    throw new Error('Failed to convert HTML to JSON using Gemini AI. Please check your API key and try again.');
  }
}
