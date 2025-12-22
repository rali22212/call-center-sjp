import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueriesModule } from './queries/queries.module';
import { TasksModule } from './tasks/tasks.module';
import { RemarksModule } from './remarks/remarks.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, QueriesModule, TasksModule, RemarksModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
