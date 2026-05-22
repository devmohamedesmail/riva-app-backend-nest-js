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
    UseGuards
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

@Controller('areas')
export class AreasController {
    constructor(private readonly areasService: AreasService) { }

    /**
     * Create new area
     * @param dto 
     * @returns 
     */
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateAreaDto) {
        return this.areasService.create(dto);
    }

    /**
     * Get all areas
     * - Supports pagination and search by name or area code
     * @param search Search term for name or area code
     * @param place_id Filter by place ID
     * @param page Page number for pagination
     * @param limit Number of items per page
     * @returns List of areas with pagination info
     */
    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('place_id') place_id?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.areasService.findAll(
            search,
            place_id ? Number(place_id) : undefined,
            page ? Number(page) : 1,
            limit ? Number(limit) : 10,
        );
    }



    /**
     * Get areas by place ID
     * @param place_id 
     * @returns 
     */
    @Get('place/:place_id')
    getByPlaceId(
        @Param('place_id', ParseIntPipe)
        place_id: number,
    ) {
        return this.areasService.getByPlaceId(place_id);
    }

    /**
     * Find one area
     * @param id Area ID
     * @returns Area details
     */
    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.areasService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(
        @Param('id', ParseIntPipe)
        id: number,

        @Body()
        dto: UpdateAreaDto,
    ) {
        return this.areasService.update(id, dto);
    }

    /**
     * Delete area
     * @param id Area ID
     * @returns Confirmation message
     */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe)
        id: number,
    ) {
        return this.areasService.remove(id);
    }
}
