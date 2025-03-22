"use client";

import { Modal, Accordion } from "flowbite-react";
import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import Styles from "./ChangelogModal.module.css";
import { tryCatch } from "#/api/utils";

export const ChangelogModal = (props: {
  isOpen: boolean;
  setIsOpen: any;
  version: string;
  previousVersions: Array<string>;
}) => {
  const [currentVersionChangelog, setCurrentVersionChangelog] = useState("");
  const [previousVersionsChangelog, setPreviousVersionsChangelog] = useState<
    Record<string, string>
  >({});

  async function _fetchVersionChangelog(version: string) {
    const { data, error } = await tryCatch(fetch(`/changelog/${version}.md`));
    if (error) {
      return "Нет списка изменений";
    }
    return await data.text();
  }

  useEffect(() => {
    if (props.version != "" && currentVersionChangelog == "") {
      setCurrentVersionChangelog("Загрузка ...");
      _fetchVersionChangelog(props.version).then((data) => {
        setCurrentVersionChangelog(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.version]);

  return (
    <Modal show={props.isOpen} onClose={() => props.setIsOpen(false)}>
      <Modal.Header>Список изменений v{props.version}</Modal.Header>
      <Modal.Body>
        <Markdown className={Styles.markdown}>
          {currentVersionChangelog}
        </Markdown>
        <Accordion collapseAll={true} className="mt-4">
          {props.previousVersions.length > 0 &&
            props.previousVersions.map((version) => {
              return (
                <Accordion.Panel key={version}>
                  <Accordion.Title
                    onClickCapture={(e) => {
                      if (!previousVersionsChangelog.hasOwnProperty(version)) {
                        _fetchVersionChangelog(version).then((data) => {
                          setPreviousVersionsChangelog((prev) => {
                            return {
                              ...prev,
                              [version]: data,
                            };
                          });
                        });
                      }
                    }}
                  >
                    Список изменений v{version}
                  </Accordion.Title>
                  <Accordion.Content>
                    {previousVersionsChangelog.hasOwnProperty(version) ?
                      <Markdown className={Styles.markdown}>
                        {previousVersionsChangelog[version]}
                      </Markdown>
                    : <div>Загрузка ...</div>}
                  </Accordion.Content>
                </Accordion.Panel>
              );
            })}
        </Accordion>
      </Modal.Body>
    </Modal>
  );
};
