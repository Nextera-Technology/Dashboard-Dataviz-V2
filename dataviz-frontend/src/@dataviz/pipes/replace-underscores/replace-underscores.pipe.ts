import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "replaceUnderscores",
  standalone: true, // Important for standalone components
})
export class ReplaceUnderscoresPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value === null || value === undefined) {
      return "";
    }
    return value.replace(/_/g, " ");
  }
}
