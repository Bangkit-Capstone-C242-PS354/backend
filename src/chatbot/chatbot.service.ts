import { Injectable } from '@nestjs/common';
import {
  VertexAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google-cloud/vertexai';

@Injectable()
export class ChatbotService {
  private readonly vertexAI: VertexAI;
  private readonly generativeModel;

  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.VERTEX_AI_PROJECT,
      location: process.env.VERTEX_AI_LOCATION,
    });

    this.generativeModel = this.vertexAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        maxOutputTokens: 256,
      },
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: 'You are a helpful assistant that provides clear and concise responses.',
          },
        ],
      },
    });
  }

  async chat(message: string) {
    const chat = this.generativeModel.startChat();
    const result = await chat.sendMessage(message);
    const response = await result.response;

    return {
      reply: response.text(),
    };
  }
}
