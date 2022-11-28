import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedSubjectService } from './shared-subject.service'; 

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [],
    providers: [SharedSubjectService]
})
export class SharedSubjectModule { }