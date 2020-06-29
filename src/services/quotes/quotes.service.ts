import { Injectable, HttpService } from '@nestjs/common'
import { map } from 'rxjs/operators'

@Injectable()
export class QuotesService {

    constructor(private http: HttpService){

    }

    getQuotes(){
        return this.http.get('http://quotesondesign.com/wp-json/posts')
            .pipe(
                map(response => response.data)
            )
    }
}
