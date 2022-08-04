import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { TRANSLATIONS_EN } from "./en/translations";
import { TRANSLATIONS_FL } from "./fl/translations";

i18next
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: TRANSLATIONS_EN
            },
            fl: {
                translation: TRANSLATIONS_FL
            }
        }
    })

i18next.changeLanguage('fl')