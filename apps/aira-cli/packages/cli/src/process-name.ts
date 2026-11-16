export const CLI_COMMAND_NAME = "aira";
export const CLI_PROCESS_NAME = "aira-cli";

interface ProcessTitleTarget {
  title: string;
}

export const setCliProcessTitle = (
  target: ProcessTitleTarget = process,
): void => {
  target.title = CLI_PROCESS_NAME;
};
