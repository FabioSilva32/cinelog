// An explicit saved empty banner means removed, not "use another cached banner".
export function ownBannerUrl(profile,userId,storage,shop={}){
 if(profile.banner_url!==undefined && profile.banner_url!==null)return profile.banner_url;
 if(shop.bannerUrl!==undefined && shop.bannerUrl!==null)return shop.bannerUrl;
 return userId?storage.getItem(`cinelog_banner_url_${userId}`)||'':'';
}
