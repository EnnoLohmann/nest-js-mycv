import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
  ) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.reportRepository.create(reportDto);
    report.user = user;
    return this.reportRepository.save(report);
  }

  async updateReportApproval(id: number, approved: boolean) {
    console.log('Test');
    const report = await this.reportRepository.findOneBy({ id });
    console.log('Test');

    if (!report) {
      throw new NotFoundException('Report for given id was not found');
    }
    console.log('Test');

    report.approved = approved;

    return this.reportRepository.save(report);
  }

  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return this.reportRepository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage -:milage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
