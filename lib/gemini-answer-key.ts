import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function convertAnswerKeyHtmlToJson(htmlContent: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Convert the following HTML content from an answer key page into a structured JSON object.

The JSON object must strictly follow this structure:
{
  "pageTitle": "String",
  "mainContent": {
    "pageArticle": {
      "title": "String",
      "postDate": "String",
      "description": "String",
      "imageUrl": "String",
      "imageAlt": "String"
    },
    "summaryDetails": {
      "title": "String",
      "shortDescription": "String",
      "websiteLink": {
        "text": "String",
        "link": "String"
      },
      "sections": [
        {
          "title": "String",
          "items": [
            {
              "key": "String",
              "value": "String"
            }
          ]
        }
      ]
    },
    "eligibilityAndPosts": {
      "ageLimits": {
        "title": "String",
        "items": [
          {
            "key": "String",
            "value": "String"
          }
        ]
      },
      "totalPost": {
        "title": "String",
        "count": "String"
      }
    },
    "vacancyDetails": {
      "title": "String",
      "posts": [
        {
          "postName": "String",
          "noOfPost": "String"
        }
      ],
      "eligibility": [
        {
          "postName": "String",
          "eligibilityCriteria": "String"
        }
      ],
      "youMayAlsoCheck": {
        "text": "String",
        "link": "String"
      }
    },
    "howToCheckAndDownloadInstructions": {
      "title": "String",
      "steps": [
        "String"
      ]
    },
    "modeOfSelection": {
      "title": "String",
      "steps": [
        "String"
      ]
    },
    "importantLinks": {
      "title": "String",
      "links": [
        {
          "title": "String",
          "link": "String",
          "status": "String"
        }
      ]
    },
    "faqSection": {
      "title": "String",
      "questions": [
        {
          "question": "String",
          "answer": "String"
        }
      ]
    },
    "latestPosts": [
      {
        "title": "String",
        "link": "String"
      }
    ],
    "relatedPosts": [
      {
        "title": "String",
        "link": "String"
      }
    ]
  }
}

Extract the information from the HTML and format it into the JSON structure. If some information is not available, the corresponding field can be null or an empty array.

The final output must be ONLY a valid JSON object, with no extra text, comments, or markdown.

HTML:
${htmlContent}

JSON:`

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
