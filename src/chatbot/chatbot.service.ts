import { Injectable } from '@nestjs/common';
import {
  VertexAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google-cloud/vertexai';
import { TransactionService } from '../transaction/transaction.service';
import { Transaction } from '../transaction/interfaces/transaction.interface';

@Injectable()
export class ChatbotService {
  private vertexAI: VertexAI;

  constructor(private readonly transactionService: TransactionService) {
    this.vertexAI = new VertexAI({
      project: process.env.VERTEX_AI_PROJECT,
      location: process.env.VERTEX_AI_LOCATION,
    });
  }

  async chat(userId: string, message: string) {
    const transactions =
      await this.transactionService.getUserTransactions(userId);
    const transactionContext = this.formatTransactionsForContext(transactions);

    const generativeModel = this.vertexAI.getGenerativeModel({
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
            text: `You are a helpful financial assistant. When analyzing transactions:
            1. Look for spending patterns
            2. Identify potential areas for savings
            3. Provide actionable financial advice
            4. Be specific but concise in your recommendations
            5. If you notice unusual spending patterns, mention them
            6. Always maintain a professional and supportive tone

            Here are the user's recent transactions (note that the unit of the transactions is in Rupiah):
            ${transactionContext}`,
          },
        ],
      },
    });

    const chat = generativeModel.startChat();
    const result = await chat.sendMessage(message);
    const response = await result.response;

    return {
      reply: response.candidates[0].content.parts[0].text,
    };
  }

  private formatTransactionsForContext(transactions: Transaction[]): string {
    return transactions
      .slice(0, 10) // Only use last 10 transactions for context
      .map(
        (t) =>
          `${t.date}: ${t.type} - ${t.title} (${t.category}) - Rp ${t.amount}`,
      )
      .join('\n');
  }
}
