import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBannerDto } from './dto/create-banner.dto';

@Controller('/api/v1/banners')
export class BannersController {
    constructor(private readonly bannerService: BannersService) { }


    @Get()
    findAll() {
        return this.bannerService.findAll();
    }



    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.findOne(id);
    }


    @Post('create')
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() dto: CreateBannerDto,
        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.bannerService.create(dto, file);
    }

    /**
     * Update banner
     * Route: PUT /banners/update/:id
     * - Updates only provided fields
     * - Optional image upload (can be extended)
     */
    @Put('update/:id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBannerDto,
        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.bannerService.update(id, dto, file);
    }

    /**
     * Delete banner
     * Route: DELETE /banners/:id
     * - Removes banner permanently from DB
     */
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.bannerService.remove(id);
    }

}
