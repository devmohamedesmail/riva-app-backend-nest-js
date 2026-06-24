import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors,
    UseGuards
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { StoreTypesService } from './store-types.service';
import { CreateStoreTypeDto } from './dto/create-store-type.dto';
import { UpdateStoreTypeDto } from './dto/update-store-type.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('/api/v1/store-types')
export class StoreTypesController {
    constructor(
        private readonly service: StoreTypesService,
    ) { }


    @Get('get-stores')
    getStores(
        @Query('place_id') place_id: string,

        @Query('store_type_id')
        store_type_id: string,
    ) {
        return this.service.getStores(
            Number(place_id),
            Number(store_type_id),
        );
    }


    @Get()
    findAll() {
        return this.service.findAll();
    }


    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.service.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    @UseInterceptors(
        FileInterceptor('image'),
    )
    create(
        @Body()
        dto: CreateStoreTypeDto,

        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.service.create(dto, file);
    }


    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    @UseInterceptors(
        FileInterceptor('image'),
    )
    update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateStoreTypeDto,

        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.service.update(
            id,
            dto,
            file,
        );
    }

    @Get('place/:placeId')
     getStoreTypesByPlaceId(@Param('placeId', ParseIntPipe) id: number) {
        return this.service.getStoreTypesByPlaceId(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.service.remove(id);
    }
}
