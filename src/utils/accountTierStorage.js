// Account-scoped tier caches prevent rankings from another login being uploaded.
export function accountTierStorage(storage,userId){
 const owner=userId||'guest',prefix='cinelog_tiers:'+owner+':';
 const legacyOwner=storage.getItem('cinelog_tier_legacy_owner');
 return {getItem(key){const value=storage.getItem(prefix+key);if(value!==null)return value;if(userId&&legacyOwner===userId){const legacy=storage.getItem(key);if(legacy!==null){storage.setItem(prefix+key,legacy);return legacy;}}return null;},setItem:(key,value)=>storage.setItem(prefix+key,value),removeItem:key=>storage.removeItem(prefix+key)};
}
