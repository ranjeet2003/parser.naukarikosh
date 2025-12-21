# URL to JSON Converter

This is a fullstack Next.js application that allows you to input a URL, fetch its HTML content, send it to Google's Gemini AI for conversion into a structured JSON format, and then download the resulting JSON.

## Features

*   **Frontend:**
    *   User-friendly interface for URL input.
    *   Real-time feedback for loading and errors.
    *   Displays the AI-generated JSON output.
    *   Option to download the JSON as a file.
*   **Backend (Next.js API Route):**
    *   Handles URL fetching and communication with Gemini AI.
    *   Robust error handling.
*   **Gemini AI Integration:**
    *   Leverages Google's Gemini AI to intelligently parse and structure HTML content into JSON.

## Setup

To run this project locally, follow these steps:

### 1. Install Dependencies

First, install the necessary Node.js packages:

```bash
npm install axios cheerio @google/generative-ai
```

### 2. Configure Gemini API Key

You need a Google Gemini API key to use the AI conversion feature.

1.  **Get your API Key:** If you don't have one, you can obtain it from the [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Create `.env.local`:** In the root directory of your project, create a file named `.env.local`.
3.  **Add your API Key:** Add the following line to your `.env.local` file, replacing `YOUR_GEMINI_API_KEY` with your actual key:

    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

    **Note:** Do not commit your `.env.local` file to version control. It's already included in `.gitignore`.

### 3. Run the Development Server

Once the dependencies are installed and your API key is configured, start the Next.js development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## Usage

1.  Open your browser and navigate to `http://localhost:3000`.
2.  Enter a valid URL (e.g., `https://www.example.com`) into the input field.
3.  Click the "Convert to JSON" button.
4.  The application will fetch the HTML, send it to Gemini AI, and display the resulting JSON.
5.  You can then click "Download JSON" to save the output to your local machine.

## Project Structure

*   `app/page.tsx`: The main client-side component for the URL input and JSON display.
*   `app/api/parse-url/route.ts`: The Next.js API route that handles fetching HTML and calling the Gemini AI.
*   `lib/gemini.ts`: A utility file encapsulating the Gemini AI interaction logic.
*   `app/globals.css`: Global CSS styles, including custom color palette.
*   `tailwind.config.ts`: Tailwind CSS configuration with custom colors and animations.
*   `components/ui/*`: Shadcn UI components (read-only, provided by template).
*   `hooks/use-toast.ts`: Toast hook (read-only, provided by template).
