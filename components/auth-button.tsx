from pydantic import BaseModel, Field
import json
import uuid

# Pydantic models have been redefined according to the new JSON structure

class StartsAt(BaseModel):
  day: int | None = Field(default=None)
  month: int | None = Field(default=None)
  year: int | None = Field(default=None)

class Education(BaseModel):
  starts_at: StartsAt | None = Field(default=None)
  ends_at: StartsAt | None = Field(default=None)
  field_of_study: str | None = Field(default=None)
  degree_name: str | None = Field(default=None)
  school: str | None = Field(default=None)
  school_linkedin_profile_url: str | None = Field(default=None)

class Experience(BaseModel):
  starts_at: StartsAt | None = Field(default=None)
  ends_at: StartsAt | None = Field(default=None)
  company: str | None = Field(default=None)
  company_linkedin_profile_url: str | None = Field(default=None)
  title: str | None = Field(default=None)
  description: str | None = Field(default=None)
  location: str | None = Field(default=None)
  logo_url: str | None = Field(default=None)

class Profile(BaseModel):
  public_identifier: str
  profile_pic_url: str | None = Field(default=None)
  background_cover_image_url: str | None = Field(default=None)
  first_name: str | None = Field(default=None)
  last_name: str | None = Field(default=None)
  full_name: str | None = Field(default=None)
  occupation: str | None = Field(default=None)
  headline: str | None = Field(default=None)
  country: str | None = Field(default=None)
  country_full_name: str | None = Field(default=None)
  city: str | None = Field(default=None)
  state: str | None = Field(default=None)
  experiences: list[Experience]
  education: list[Education]
  languages: list[str] | None = Field(default=None)
  accomplishment_organisations: list | None = Field(default=None)
  accomplishment_projects: list | None = Field(default=None)
  accomplishment_publications: list | None = Field(default=None)
  accomplishment_honors_awards: list | None = Field(default=None)
  accomplishment_patents: list | None = Field(default=None)

def transform_data(input_path, output_path):
  with open(input_path, 'r') as file, open(output_path, 'w') as outfile:
    for line in file:
      # Create a new structure with the required fields and additional UUID
      new_structure = json.loads(line)
      new_structure["uuid"] = str(uuid.uuid4())
      json.dump(new_structure, outfile)
      outfile.write('\n')

# Replace these paths with the actual file paths
input_file_path = 'step1.jsonl'
output_file_path = 'step1/step1.jsonl'

transform_data(input_file_path, output_file_path)
