import { Module, HttpModule  } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TransformInterceptor } from './transformers/app.interceptor'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { NetworkModule } from './network/network.module'
import { LinenotiModule } from './linenoti/linenoti.module'
import { QuotesService } from './services/quotes/quotes.service'

@Module({
  imports: [
    HttpModule,
    NetworkModule,
    LinenotiModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor
    },
    QuotesService
  ]
})
export class AppModule {}
