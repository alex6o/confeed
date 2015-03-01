/// <reference path="dto.d.ts" />

export class SearchQuery implements DTO.ISearchQuery{
  lastId: string;
  limit: number;
  direction: number;
}

export class User implements DTO.IUser {
  id: number;
  created: Date;
  username: string;
}
