"use server";

import { Card } from "flowbite-react";
import Image from "next/image";

import * as fs from "node:fs";
import * as path from "node:path";
import { CURRENT_APP_VERSION } from "#/api/config";
import Styles from "../components/ChangelogModal/ChangelogModal.module.css";
import Markdown from "markdown-to-jsx";

import {
  Accordion,
  AccordionContent,
  AccordionPanel,
  AccordionTitle,
} from "flowbite-react";
import Link from "next/link";

export const AboutPage = () => {
  const directoryPath = path.join(process.cwd(), "public/changelog");
  const files = fs.readdirSync(directoryPath);
  const current = {
    version: CURRENT_APP_VERSION,
    changelog: `#${CURRENT_APP_VERSION}\r\nНет списка изменений`,
  };
  const previous = [];

  if (files.includes(`${CURRENT_APP_VERSION}.md`)) {
    const changelog = fs.readFileSync(
      path.join(directoryPath, `${CURRENT_APP_VERSION}.md`),
      "utf8"
    );
    current.changelog = changelog;
  }

  files.forEach((file) => {
    if (file != `${CURRENT_APP_VERSION}.md`) {
      const changelog = fs.readFileSync(path.join(directoryPath, file), "utf8");
      previous.push({
        version: file.replace(".md", ""),
        changelog: changelog,
      });
    }
  });

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
      <Link href={"https://wah.su/radiquum"} target="_blank">
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
      </Link>
      <Link href={"https://t.me/anix_web"} target="_blank">
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
      </Link>
      <Link href={"https://github.com/Radiquum/AniX"} target="_blank">
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
      </Link>
      <Card className="md:col-span-2 lg:col-span-3">
        <h1 className="text-2xl font-bold">Список изменений</h1>
        <Markdown className={Styles.markdown}>{current.changelog}</Markdown>
        <Accordion collapseAll={true}>
          {previous.reverse().map((changelog) => (
            <AccordionPanel key={changelog.version}>
              <AccordionTitle>v{changelog.version}</AccordionTitle>
              <AccordionContent>
                <Markdown className={Styles.markdown}>
                  {changelog.changelog}
                </Markdown>
              </AccordionContent>
            </AccordionPanel>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};
