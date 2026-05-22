import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('/api/v1/categories')
export class CategoriesController {
    constructor(
        private readonly service: CategoriesService,
    ) { }


    /**
     * Get all
     */
    @Get()
    findAll() {
        return this.service.findAll();
    }


    /**
    * Find one
    */
    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.service.findOne(id);
    }


    /**
     * Create
     */
    @Post()
    @UseInterceptors(
        FileInterceptor('image'),
    )
    create(
        @Body()
        dto: CreateCategoryDto,

        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.service.create(dto, file);
    }


    /**
     * Update
     */
    @Put(':id')
    @UseInterceptors(
        FileInterceptor('image'),
    )
    update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateCategoryDto,

        @UploadedFile()
        file?: Express.Multer.File,
    ) {
        return this.service.update(
            id,
            dto,
            file,
        );
    }


    /**
     * Delete
     */
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.service.remove(id);
    }


    /**
    * Get by store
    */
    @Get('store/:store_id')
    getByStore(
        @Param('store_id', ParseIntPipe)
        store_id: number,
    ) {
        return this.service.getByStore(
            store_id,
        );
    }


    /**
   * Get by store type
   */
    @Get('store-type/:store_type_id')
    getByStoreType(
        @Param(
            'store_type_id',
            ParseIntPipe,
        )
        store_type_id: number,
    ) {
        return this.service.getByStoreType(
            store_type_id,
        );
    }
}
