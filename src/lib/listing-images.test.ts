import {describe,it,expect} from 'vitest';
import {removeListingImage,selectMainImage} from './listing-images';
describe('Listing image rules',()=>{
 it('removing the main image chooses the remaining image',()=>expect(removeListingImage(['original','other'],0)).toEqual({images:['other'],image:'other'}));
 it('removing a secondary image preserves the main image',()=>expect(removeListingImage(['original','other','detail'],1)).toEqual({images:['original','detail'],image:'original'}));
 it('the last image cannot be removed',()=>expect(()=>removeListingImage(['original'],0)).toThrow('last_image'));
 it('a seller can select a different main image',()=>expect(selectMainImage(['original','other'],1)).toEqual({images:['other','original'],image:'other'}));
 it('an invalid image selection is rejected',()=>expect(()=>selectMainImage(['original'],9)).toThrow('invalid_image'));
});