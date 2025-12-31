import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { loadTranslations } from './translation-loader';
import { LoggerService } from '../services/logger.service';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private lang: string;
  private translations = new BehaviorSubject<Record<string, any>>({});

  translations$ = this.translations.asObservable();

  // Track missing key warnings so we only warn once per key
  private missingKeyWarned = new Set<string>();

  constructor(private logger: LoggerService) {
    // Get language from localStorage, default to 'es' only if nothing is stored
    this.lang = localStorage.getItem('lang') || 'es';

    // Only set default if localStorage is empty
    if (!localStorage.getItem('lang')) {
      localStorage.setItem('lang', 'es');
    }

    // Try loading translations from assets first, fall back to built-in if needed
    this.load(this.lang).then((loaded) => {
      if (!loaded) {
        this.initFallbackTranslations();
      }
    });
  }

  private initFallbackTranslations() {
    const fallbackTranslations = {
      'layout': {
        'appTitle': 'Mi Aplicación',
        'panel': 'Panel',
        'familySection': 'Familia'
      },
      'tools': {
        'language': 'Idioma',
        'spanish': 'Español',
        'english': 'English',
        'theme': 'Tema',
        'dark': 'Oscuro',
        'light': 'Claro'
      },
      'family': {
        "title": "Miembros de la familia",
        "add": "Agregar miembro",
        "birth": "Fecha de nacimiento",
        "relation": "Parentesco",
        "accountType": "Tipo de cuenta",
        "editor": "Editor",
        "readOnly": "Solo lectura",
        "active": "Activo",
        "inactive": "Inactivo"
      },
      'auth': {
        'logout': 'Cerrar sesión',
        'email': 'Correo electrónico',
        'password': 'Contraseña',
        'showPassword': 'Mostrar contraseña',
        'hidePassword': 'Ocultar contraseña',
        'login': {
          'title': 'Iniciar sesión',
          'subtitle': 'Administra tus finanzas, eventos y tareas en un solo lugar',
          'submit': 'Entrar',
          'loading': 'Ingresando...'
        },
        'register': {
          'title': 'Crear Cuenta',
          'subtitle': 'Únete y organiza tu vida familiar con facilidad',
          'fullName': 'Nombre completo',
          'relation': 'Parentesco',
          'phone': 'Teléfono',
          'confirm': 'Confirmar contraseña',
          'submit': 'Crear cuenta',
          'link': 'Crear cuenta',
          'loading': 'Creando cuenta...',
          'haveAccount': '¿Ya tienes cuenta? Inicia sesión',
          'passwordPlaceholder': 'Crea una contraseña segura',
          'showPasswordAria': 'Mostrar u ocultar contraseña',
          'phoneError': 'Ingresa un teléfono válido (10-15 dígitos)',
          'mismatchError': 'Las contraseñas no coinciden'
        },
        'reset': {
          'request': {
            'title': 'Recuperar Contraseña',
            'subtitle': 'Recibirás un código de 6 dígitos por correo',
            'submit': 'Enviar Código',
            'loading': 'Enviando código...',
            'backToLogin': 'Volver al inicio de sesión'
          },
          'verify': {
            'title': 'Verificar Código',
            'subtitle': 'Introduce el código de 6 dígitos que recibiste',
            'code': 'Código de 6 dígitos',
            'newPassword': 'Nueva contraseña',
            'confirmPassword': 'Confirmar contraseña',
            'submit': 'Cambiar Contraseña',
            'loading': 'Verificando...',
            'backToRequest': 'Solicitar nuevo código',
            'backToLogin': 'Volver al inicio'
          }
        }
      },
      'errors': {
        'required': {
          'email': 'El correo es requerido',
          'password': 'La contraseña es requerida',
          'fullName': 'El nombre completo es requerido',
          'code': 'El código es requerido',
          'confirmPassword': 'Confirmar contraseña es requerido'
        },
        'invalid': {
          'email': 'Ingresa un correo válido',
          'codePattern': 'Ingresa 6 dígitos'
        },
        'minLength': {
          'password': 'La contraseña debe tener al menos 8 caracteres',
          'passwordShort': 'Mínimo 8 caracteres'
        }
      },
      'actions': {
        "edit": "Editar",
        "deactivate": "Desactivar",
        "activate": "Activar",
        "save": "Guardar",
        "cancel": "Cancelar",
        "create": "Crear",
        "update": "Actualizar"
      },
      'aria': {
        'toggleMenu': 'Alternar menú',
        'selectLanguage': 'Seleccionar idioma',
        'tools': 'Herramientas'
      }
    };
    this.logger.debug('Setting fallback translations');
    this.translations.next(fallbackTranslations);
  }

  getCurrent(): string {
    return this.lang;
  }

  async set(lang: string): Promise<void> {
    this.logger.info && this.logger.info('Setting language to:', lang);
    if (this.lang === lang) return;

    this.lang = lang;
    localStorage.setItem('lang', lang);

    // Force update fallback translations with new language if needed
    if (lang === 'en') {
      this.setEnglishFallback();
    } else {
      this.initFallbackTranslations();
    }

    await this.load(lang);
  }

  private setEnglishFallback() {
    const englishFallback = {
      'layout': {
        'appTitle': 'My Application',
        'panel': 'Panel',
        'familySection': 'Family'
      },
      'tools': {
        'language': 'Language',
        'spanish': 'Español',
        'english': 'English',
        'theme': 'Theme',
        'dark': 'Dark',
        'light': 'Light'
      },
      'family': {
        "title": "Family members",
        "add": "Add member",
        "birth": "Date of birth",
        "relation": "Relationship",
        "accountType": "Account type",
        "editor": "Editor",
        "readOnly": "Read only",
        "active": "Active",
        "inactive": "Inactive"
      },
      'auth': {
        'logout': 'Sign Out',
        'email': 'Email',
        'password': 'Password',
        'showPassword': 'Show password',
        'hidePassword': 'Hide password',
        'login': {
          'title': 'Sign In',
          'subtitle': 'Manage your finances, events and tasks in one place',
          'submit': 'Sign In',
          'loading': 'Signing in...'
        },
        'register': {
          'title': 'Create Account',
          'subtitle': 'Join and organize your family life with ease',
          'fullName': 'Full name',
          'relation': 'Relationship',
          'phone': 'Phone',
          'confirm': 'Confirm password',
          'submit': 'Create account',
          'link': 'Create account',
          'loading': 'Creating account...',
          'haveAccount': 'Already have an account? Sign in',
          'passwordPlaceholder': 'Create a secure password',
          'showPasswordAria': 'Show or hide password',
          'phoneError': 'Enter a valid phone number (10-15 digits)',
          'mismatchError': 'Passwords do not match'
        },
        'reset': {
          'request': {
            'title': 'Reset Password',
            'subtitle': 'You will receive a 6-digit code by email',
            'submit': 'Send Code',
            'loading': 'Sending code...',
            'backToLogin': 'Back to sign in'
          },
          'verify': {
            'title': 'Verify Code',
            'subtitle': 'Enter the 6-digit code you received',
            'code': '6-digit code',
            'newPassword': 'New password',
            'confirmPassword': 'Confirm password',
            'submit': 'Change Password',
            'loading': 'Verifying...',
            'backToRequest': 'Request new code',
            'backToLogin': 'Back to sign in'
          }
        }
      },
      'errors': {
        'required': {
          'email': 'Email is required',
          'password': 'Password is required',
          'fullName': 'Full name is required',
          'code': 'Code is required',
          'confirmPassword': 'Confirm password is required'
        },
        'invalid': {
          'email': 'Enter a valid email',
          'codePattern': 'Enter 6 digits'
        },
        'minLength': {
          'password': 'Password must be at least 8 characters',
          'passwordShort': 'Minimum 8 characters'
        }
      },
      'actions': {
        "edit": "Edit",
        "deactivate": "Deactivate",
        "activate": "Activate",
        "save": "Save",
        "cancel": "Cancel",
        "create": "Create",
        "update": "Update"
      },
      'aria': {
        'toggleMenu': 'Toggle menu',
        'selectLanguage': 'Select language',
        'tools': 'Tools'
      }
    };
    console.log('Setting English fallback translations:', englishFallback);
    this.translations.next(englishFallback);
  }

  instant(key: string, fallback?: string): string {
    const map = this.translations.value || {};
    const parts = key.split('.');
    let cur: any = map;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
      else { cur = undefined; break; }
    }
    const result = typeof cur === 'string' ? cur : (fallback || key);
    if (result === key && !fallback) {
      // Warn only once per missing key to avoid console spam
      if (!this.missingKeyWarned.has(key)) {
        this.missingKeyWarned.add(key);
        console.warn('Translation missing for key:', key);
      }
    }
    return result;
  }

  private async load(lang: string): Promise<boolean> {
    this.logger.debug('Loading translations for:', lang);
    try {
      const json = await loadTranslations(lang);
      this.logger.info && this.logger.info('Loaded translations from server', json && Object.keys(json).length);
      if (json && Object.keys(json).length > 0) {
        this.translations.next(json);
        this.logger.debug && this.logger.debug('Successfully updated translations from server');
        return true;
      } else {
        this.logger.warn && this.logger.warn('Empty translations loaded from server');
        return false;
      }
    } catch (error) {
      this.logger.error && this.logger.error('Error loading translations for', lang, ':', error);
      return false;
    }
  }
}
