import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('/api/v1/places')
export class PlacesController {

    constructor(private service: PlacesService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get('search')
    search(@Query('query') query: string) {
        return this.service.search(query);
    }

    @Get('storetype/:placeId')
    getStoreTypes(@Param('placeId', ParseIntPipe) id: number) {
        return this.service.getStoreTypes(id);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.service.findOne(id);
    }

    
    @UseGuards(JwtAuthGuard)
    @Post('create')
    create(@Body() dto: CreatePlaceDto) {
        return this.service.create(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePlaceDto,
    ) {
        return this.service.update(id, dto);
    }



    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
    }
}
