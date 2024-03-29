import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'plural', standalone: true })
export class CustomPluralPipe implements PipeTransform {
  transform(
    input: number,
    customPluralForm: string = 's',
    customSingularForm: string = ''
  ): string {
    return input === 1 ? customSingularForm : customPluralForm;
  }
}
