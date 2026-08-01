class ImageCacheService {
  private cache = new Map<string, { image: HTMLImageElement; loaded: boolean; error: boolean }>();
  private preloadPromises = new Map<string, Promise<void>>();

  preloadImage(src: string): Promise<void> {
    if (this.cache.has(src)) {
      const cached = this.cache.get(src)!;
      if (cached.loaded) {
        return Promise.resolve();
      }
      if (cached.error) {
        return Promise.reject(new Error(`Image failed to load: ${src}`));
      }
    }

    if (this.preloadPromises.has(src)) {
      return this.preloadPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, { image: img, loaded: true, error: false });
        this.preloadPromises.delete(src);
        resolve();
      };
      
      img.onerror = () => {
        this.cache.set(src, { image: img, loaded: false, error: true });
        this.preloadPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    this.preloadPromises.set(src, promise);
    return promise;
  }

  isImageLoaded(src: string): boolean {
    const cached = this.cache.get(src);
    return cached ? cached.loaded : false;
  }

  isImageError(src: string): boolean {
    const cached = this.cache.get(src);
    return cached ? cached.error : false;
  }

  getCachedImage(src: string): HTMLImageElement | null {
    const cached = this.cache.get(src);
    return cached && cached.loaded ? cached.image : null;
  }

  async preloadImages(srcs: string[]): Promise<void[]> {
    const promises = srcs.map(src => 
      this.preloadImage(src).catch(error => {

        return Promise.resolve(); // Don't fail the entire batch
      })
    );
    
    return Promise.all(promises);
  }

  clearCache(): void {
    this.cache.clear();
    this.preloadPromises.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const imageCacheService = new ImageCacheService();
