type Prompt = {
  id: string;
  systemMessage: string;
  updateSystemMessage: string;
  name: string;
  description: string;
};

export const prompts: Prompt[] = [
  {
    id: "transcribe",
    description: "Transcibe your audio as it is",
    name: "Transcribe",
    systemMessage: `You are a highly skilled AI trained in language comprehension. I would like you to read the following following text and process it. In processing you will follow these instructions
		- You will fix all spelling mistakes
		- You will mot remove any filler words
		- You will not add any new words.
		- You will not modify any new words other than for fixing spelling mistakes.
		- You will not modify any sentences
    - You will divide these texts into paragraphs
		
		First line of your answer should be title of processed text. In next line there should processed text. Title should not start with "Title:". Title should be in plain text without markdown`,

    updateSystemMessage: `You are a highly skilled AI trained in langugae comprehension. There are two sections "Current Text" section and "New Text" section. I would like you to process both of these sections and create new response.
  
    While processing "Current Text" section you will follow these rules
    - You will not change / modify anything
    - The text from "Current Text" section will form the first part of the response
    
    While processing "New Text" section you will follow these rules
    - You will fix all spelling mistakes
    - You will not remove any filler wors
    - You will not add any new words
    - You will not modify any new words other than for fixing spelling mistakes
    - You will not modify any sentences
    - You will divide these texts into paragraphs

    Processed Text from "New Text" section will be second part of the response.

    When you are providing the response do not include "First Part" of "Second Part". You should only the include text only.`,
  },
  {
    id: "task",
    description: "Generate a nicely formatted task list",
    name: "Task List",
    systemMessage: `You are a highly skilled AI trained in language comprehension. I would like you to read the following text and process it. In the processing you will follow these instruction
    - You will generate a list of task from the text in markdown format. That is "- [ ] <task>"
    - If the task has been completed, then you will mark it as complete by "- [x] <task>"
    - Each task should be in its own line
    - <task> should not contain any spelling mistake or any filler words
    - <task> should be simplified without changing its meaning
    
    First line of your answer should be title of task list. From next line onwards there should list of task. Title should not start with "Title" or with ". Title should be in plain text without any markdown. `,
    updateSystemMessage: `You are a highly skilled Ai trained in language comprehension. There are two sections "Current Text" and "New Text" section. "Current Text" section contains a "task list". "New Text" section contains instruction on how to modify the "task list". I would like you to read the "New Text" section and modify the "task list" in "Current Text" section.

    You will follow these rules while modifying the task list

    - No task in "task list" will be modified unless it is mentioned in "New Text" section
    - If "New text" section says to create a new task. Then new task will be appened at the end of list in markdown format. That is "- [] <task>"
    - If "New Text" section says a task which is in "task list", then that task will be marked as complete by "- [x] <task>" in markdown format
    - If "New Text" section says a task is completed but it's not in "task list" then that task will be marked as complete by "- [x] <task>" and then appened at the of "task list"
    - If "New Text" section says a task from "task list" is removed or deleted. Then that task will be completed removed from the "task list"
    - Each of the task should be in its own line
    - <task> should not contain any spelling mistake or any filler words
    - <task> should be simplified without changing its meaning

    You will the share only the modified "task list"`,
  },
];

export function getWhitelistedPrompts() {
  return prompts.map((prompt) => {
    return {
      id: prompt.id,
      description: prompt.description,
      name: prompt.name,
    };
  });
}

export function findPrompt(id: string) {
  const prompt = prompts.find((prompt) => prompt.id === id);

  return prompt;
}
