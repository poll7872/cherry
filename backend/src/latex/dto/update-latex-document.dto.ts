import { IsString, IsOptional } from 'class-validator';

export class UpdateLatexDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
