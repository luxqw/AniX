// "use client";

import { Card } from "flowbite-react";
import Image from "next/image";

import * as fs from "node:fs";
import * as path from "node:path";
import { CURRENT_APP_VERSION } from "#/api/config";
import Styles from "../components/ChangelogModal/ChangelogModal.module.css";
import Markdown from "markdown-to-jsx";

export const AboutPage = () => {
  const directoryPath = path.join(process.cwd(), "public/changelog");
  const files = fs.readdirSync(directoryPath);
  const changelogs = [];

  files.forEach((file) => {
    if (file != `${CURRENT_APP_VERSION}.md`) {
      const changelog = fs.readFileSync(path.join(directoryPath, file), "utf8");
      changelogs.push({
        version: file.replace(".md", ""),
        changelog: changelog,
      });
    }
  });

  if (!files.includes(`${CURRENT_APP_VERSION}.md`)) {
    changelogs.push({
      version: CURRENT_APP_VERSION,
      changelog: "Нет списка изменений",
    });
  } else {
    const changelog = fs.readFileSync(
      path.join(directoryPath, `${CURRENT_APP_VERSION}.md`),
      "utf8"
    );
    changelogs.push({
      version: CURRENT_APP_VERSION,
      changelog: changelog,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-2 lg:col-span-3">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Image
            src="/images/icons/icon-512x512.png"
            className="flex-shrink-0 w-32 h-32 rounded-full"
            alt="about image"
            width={128}
            height={128}
          />
          <div>
            <h1 className="text-xl font-bold">
              AniX - Неофициальный веб клиент для Anixart
            </h1>
            <p className="max-w-[900px]">
              AniX - это неофициальный веб-клиент для Android-приложения
              Anixart. Он позволяет вам получать доступ к своей учетной записи
              Anixart и управлять ею из веб-браузера. Так-же можно
              синхронизировать и управлять списками и избранным. И самое главное
              смотреть все доступные аниме из базы Anixart.
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-4">
          <Image
            src="https://radiquum.wah.su/static/avatar_512.jpg"
            className="flex-shrink-0 w-16 h-16 rounded-full"
            alt="developer image"
            width={128}
            height={128}
          />
          <div>
            <h1 className="text-xl font-bold">Radiquum</h1>
            <p className="text-sm text-gray-500 dark:text-gray-200">
              Разработчик
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 iconify fa6-brands--telegram text-[#001725] dark:text-[#faf8f9]"></span>
          <div>
            <h1 className="text-xl font-bold">Телеграм канал</h1>
            <p className="text-sm text-gray-500 dark:text-gray-200">
              @anix_web
            </p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-4">
          <span className="flex-shrink-0 w-16 h-16 iconify fa6-brands--github text-[#001725] dark:text-[#faf8f9]"></span>
          <div>
            <h1 className="text-xl font-bold">Код на GitHub</h1>
            <p className="text-sm text-gray-500 dark:text-gray-200">
              github.com/Radiquum/AniX
            </p>
          </div>
        </div>
      </Card>
      <Card className="md:col-span-2 lg:col-span-3">
        <h1 className="text-2xl font-bold">Список изменений</h1>
        {changelogs.reverse().map((changelog) => (
          <div key={changelog.version} className="my-4">
            <Markdown className={Styles.markdown}>
              {changelog.changelog}
            </Markdown>
          </div>
        ))}
      </Card>
    </div>
  );
};
