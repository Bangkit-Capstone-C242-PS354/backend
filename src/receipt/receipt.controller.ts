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
  Get,
  Query,
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
  ) {
    const result = await this.receiptService.uploadReceipt(req.user.uid, file);
    return {
      message: 'Receipt uploaded successfully',
      data: result,
    };
  }

  @Get('check')
  async checkReceipt(@Query('filename') filename: string) {
    const receipt = await this.receiptService.getReceiptByFilename(filename);

    if (!receipt) {
      return {
        message: 'Receipt not found or still processing',
        data: null,
      };
    }

    // Convert Firestore timestamp to readable date string
    const timestamp = receipt.created_at;
    const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds

    return {
      message: 'Receipt found',
      data: {
        created_at: date.toISOString(), // This will format as "2024-03-21T15:30:00.000Z"
        extracted_data: receipt.extracted_data,
        image_url: receipt.image_url,
        file_name: receipt.file_name,
        status: receipt.status,
      },
    };
  }
}
