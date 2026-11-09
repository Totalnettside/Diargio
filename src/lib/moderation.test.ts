import {describe,it,expect} from 'vitest';
import {canReview,contentChanged,listingContentSchema} from './moderation';
describe('Listing review rules',()=>{
  it('pending versions can be reviewed',()=>expect(canReview('draft','pending')).toBe(true));
  it('withdrawn listings cannot be republished',()=>expect(canReview('withdrawn','pending')).toBe(false));
  it('sold listings cannot be republished',()=>expect(canReview('sold','pending')).toBe(false));
  it('processed versions cannot be decided twice',()=>expect(canReview('published','published')).toBe(false));
  for(const key of ['image','images','artistName','description','condition','type','edition','ownWork']) {
    it(`${key} needs a content review`,()=>expect(contentChanged({[key]:'before'},{[key]:'after'})).toBe(true));
  }
  it('price and delivery may change without content review',()=>expect(contentChanged({title:'A',price:2000,delivery:'Må hentes'},{title:'A',price:3000,delivery:'Kan sendes'})).toBe(false));
  it('mandatory content cannot be omitted',()=>expect(listingContentSchema.safeParse({id:'a',title:'A'}).success).toBe(false));
});