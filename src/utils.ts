import {Page, SubmissionStatus} from "./types";

export function toPageDTO<T>(findAndCount: [T[], number], page: number, limit: number): Page<T> {
    return {
        contents: findAndCount[0],
        currentPage: page,
        perPage: limit,
        totalElements: findAndCount[1],
        totalPage: Math.ceil(findAndCount[1] / limit),
    }
}

export const createUpdateData = (entity: any, body: any) => {
    Object.keys(body).forEach(key => {
      if(body[key] !== undefined && body[key] !== null) {
        entity[key] = body[key];
      }
    });
    return entity;
}

export const formatObject = (obj: any) => {
  let newObj: any = {};
  Object.keys(obj).forEach(key => {
    if(obj[key] === undefined || obj[key] === null || (typeof obj[key] === 'string' && obj[key].trim() === '')) {
      return;
    }
    
    newObj[key] = obj[key];
  });
  
  return newObj;
}

export const base64Decode = (data: string) => {
  return decodeURIComponent(escape(atob(data)));
}

export const base64Encode = (data: string) => {
  return btoa(unescape(encodeURIComponent(data)));
}

export const getSubmissionStatus = (status: number) => {
  switch (status) {
    case 1:
    case 2:
      return SubmissionStatus.PENDING;
    case 3:
      return SubmissionStatus.ACCEPTED;
    case 6:
      return SubmissionStatus.COMPILATION_ERROR;
    case 4:
    case 5:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
      return SubmissionStatus.PARTIAL;
    default:
      return SubmissionStatus.PARTIAL
  }
}