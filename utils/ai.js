import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeTicket = async (ticket) => {
  try {
    console.log("🤖 Analyzing ticket with Gemini AI...");
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a technical support ticket analyzer. Analyze this support ticket and provide a JSON response.

Ticket Title: ${ticket.title}
Ticket Description: ${ticket.description}

Provide your analysis in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "summary": "Brief 1-2 sentence summary of the issue",
  "priority": "low or medium or high",
  "helpfulNotes": "Detailed technical explanation with troubleshooting steps and useful resources",
  "relatedSkills": ["skill1", "skill2", "skill3"]
}

Important:
- priority must be exactly one of: low, medium, high
- helpfulNotes should be detailed and helpful for a moderator
- relatedSkills should be an array of 2-4 relevant technical skills
- Return ONLY the JSON object, no other text`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("📄 Raw AI response:", text.substring(0, 200) + "...");

    // Try to extract JSON from response
    let jsonData;
    
    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    try {
      // Try to parse the cleaned text
      jsonData = JSON.parse(cleanedText);
    } catch (parseError) {
      // If that fails, try to find JSON object in the text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from AI response");
      }
    }

    // Validate and sanitize the response
    const validPriorities = ["low", "medium", "high"];
    const sanitizedResponse = {
      summary: jsonData.summary || "No summary provided",
      priority: validPriorities.includes(jsonData.priority) 
        ? jsonData.priority 
        : "medium",
      helpfulNotes: jsonData.helpfulNotes || "No helpful notes provided",
      relatedSkills: Array.isArray(jsonData.relatedSkills) 
        ? jsonData.relatedSkills 
        : []
    };

    console.log("✅ AI analysis successful:", sanitizedResponse);
    return sanitizedResponse;

  } catch (error) {
    console.error("❌ AI Analysis Error:", error.message);
    console.error(error);
    
    // Return a fallback response instead of null
    return {
      summary: "Unable to analyze ticket automatically",
      priority: "medium",
      helpfulNotes: `This ticket requires manual review. Title: ${ticket.title}. Description: ${ticket.description}`,
      relatedSkills: ["General Support"]
    };
  }
};

export default analyzeTicket;