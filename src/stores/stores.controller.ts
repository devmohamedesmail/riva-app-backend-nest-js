import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    Req,
    ParseIntPipe
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('/api/v1/stores')
export class StoresController {
    constructor(private readonly storesService: StoresService) { }

    @Get()
    findAll(@Query() query: any) {
        return this.storesService.findAll(query);
    }


    @Get('show/:id')
    findOne(@Param('id') id: string) {
        return this.storesService.findOne(+id);
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logo', maxCount: 1 },
            { name: 'banner', maxCount: 1 },
        ]),
    )
    create(
        @Body() dto: CreateStoreDto,

        @UploadedFiles()
        files: {
            logo?: Express.Multer.File[];
            banner?: Express.Multer.File[];
        },

        @Req() req: any,
    ) {
        return this.storesService.create(
            dto,
            req.user.id,
            files,
        );
    }


    @Put('update/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'logo', maxCount: 1 },
            { name: 'banner', maxCount: 1 },
        ]),
    )
    update(
        @Param('id', ParseIntPipe) id: number,

        @Body() dto: UpdateStoreDto,

        @UploadedFiles()
        files: {
            logo?: Express.Multer.File[];
            banner?: Express.Multer.File[];
        },

        @Req() req: any,
    ) {
        return this.storesService.update(
            id,
            dto,
            req.user.id,
            files,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    remove(@Param('id') id: string) {
        return this.storesService.remove(+id);
    }

    @Get(':id/categories')
    getCategories(@Param('id') id: string) {
        return this.storesService.getCategories(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':store_id/categories')
    assignCategories(
        @Param('store_id') storeId: string,
        @Body('category_ids') categoryIds: number[],
    ) {
        return this.storesService.assignCategories(+storeId, categoryIds);
    }

    @Get(':id/products')
    getProducts(@Param('id') id: string) {
        return this.storesService.getProducts(+id);
    }

    @Get('type/:store_type_id')
    getByStoreType(@Param('store_type_id') storeTypeId: string) {
        return this.storesService.getByStoreType(+storeTypeId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('toggle-status/:id')
    toggleStatus(@Param('id') id: string) {
        return this.storesService.toggleStatus(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('verify-store/:id')
    verifyStore(@Param('id') id: string) {
        return this.storesService.verifyStore(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('toggle-featured/:id')
    toggleFeatured(@Param('id') id: string) {
        return this.storesService.toggleFeatured(+id);
    }

    @Post('featured')
    getFeaturedStores(@Body('place_id') placeId: number) {
        return this.storesService.getFeaturedStores(placeId);
    }
}
