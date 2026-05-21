import {
    Controller,
    Post,
    Get,
    Put,
    Patch,
    Body,
    Param,
    UploadedFiles,
    UseInterceptors,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
@Controller('/api/v1/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logo', maxCount: 1 },
            { name: 'banner', maxCount: 1 },
        ]),
    )
    async create(
        @Body() body: any,

        @UploadedFiles()
        files: {
            logo?: any[];
            banner?: any[];
        },
    ) {
        return this.settingsService.create(
            body,
            files,
        );
    }




    @Get()
  async get() {
    return this.settingsService.get();
  }



  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,

    @Body() body: any,

    @UploadedFiles()
    files: {
      logo?: any[];
      banner?: any[];
    },
  ) {
    return this.settingsService.update(
      Number(id),
      body,
      files,
    );
  }


   @UseGuards(AuthGuard('jwt'))
  @Patch('maintenance/:id')
  async toggleMaintenance(
    @Param('id') id: string,

    @Body() body: any,
  ) {
    return this.settingsService.toggleMaintenance(
      Number(id),
      body,
    );
  }
}
