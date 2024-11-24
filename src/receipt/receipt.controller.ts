import {
  Controller,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';
import { AuthGuard } from '../guard/auth.guard';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@Controller('receipts')
@UseGuards(AuthGuard)
@UseInterceptors(TransformInterceptor)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('receipt'))
  async uploadReceipt(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ message: string; data: { url: string } }> {
    const url = await this.receiptService.uploadReceipt(req.user.uid, file);
    return { message: 'Receipt uploaded successfully', data: { url } };
  }
}
