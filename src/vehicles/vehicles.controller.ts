import { Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Req, } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('/api/v1/vehicles')
export class VehiclesController {


    constructor(private readonly vehicleService: VehiclesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Req() req, @Body() dto: CreateVehicleDto, @UploadedFile() file: Express.Multer.File) {
    return this.vehicleService.createVehicle(req.user.id, dto, file);
  }

  @Get()
  getAll() {
    return this.vehicleService.getVehicles();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.vehicleService.getVehicle(Number(id));
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.vehicleService.updateVehicle(Number(id), dto, file);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vehicleService.deleteVehicle(Number(id));
  }
}
