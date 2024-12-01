import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { AuthGuard } from '../guard/auth.guard';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { ChatMessageDto } from './dto/chat-message.dto';

@Controller('chatbot')
@UseGuards(AuthGuard)
@UseInterceptors(TransformInterceptor)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Request() req, @Body() chatMessageDto: ChatMessageDto) {
    const response = await this.chatbotService.chat(
      req.user.uid,
      chatMessageDto.message,
    );
    return {
      message: 'Chat response generated successfully',
      data: response,
    };
  }
}
