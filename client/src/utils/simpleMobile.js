import { Capacitor } from '@capacitor/core'

export class SimpleMobileUtils {
  static isMobile() {
    return Capacitor.isNativePlatform()
  }

  static getPlatform() {
    return Capacitor.getPlatform()
  }

  static isAndroid() {
    return Capacitor.getPlatform() === 'android'
  }

  static isIOS() {
    return Capacitor.getPlatform() === 'ios'
  }

  static isWeb() {
    return Capacitor.getPlatform() === 'web'
  }

  static async vibrate(duration = 100) {
    if (this.isMobile() && 'vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }

  static async getDeviceInfo() {
    if (this.isMobile()) {
      try {
        const { Device } = await import('@capacitor/device')
        return await Device.getInfo()
      } catch (error) {
        console.error('Failed to get device info:', error)
        return null
      }
    }
    return {
      platform: 'web',
      operatingSystem: navigator.platform,
      model: 'browser',
    }
  }

  static async shareContent(title, text, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return true
      } catch (error) {
        console.error('Error sharing:', error)
        return false
      }
    }
    return false
  }
}

export default SimpleMobileUtils
