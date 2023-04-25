import React, { useEffect, useRef } from "react";
import { type NextPage } from "next";
import Badge from "../components/Badge";
import DefaultLayout from "../layout/default";
import ChatWindow from "../components/ChatWindow";
import Drawer from "../components/Drawer";
import Input from "../components/Input";
import Button from "../components/Button";
import { FaRobot, FaStar } from "react-icons/fa";
import PopIn from "../components/motions/popin";
import { VscLoading } from "react-icons/vsc";
import AutonomousAgent from "../components/AutonomousAgent";
import Expand from "../components/motions/expand";
import HelpDialog from "../components/HelpDialog";
import SettingsDialog from "../components/SettingsDialog";
import { GPT_35_TURBO, DEFAULT_MAX_LOOPS_FREE } from "../utils/constants";
import { TaskWindow } from "../components/TaskWindow";
import { useAuth } from "../hooks/useAuth";
import type { Message } from "../types/agentTypes";
import { useAgent } from "../hooks/useAgent";

const Home: NextPage = () => {
  const { session, status } = useAuth();
  const [name, setName] = React.useState<string>("");
  const [goalInput, setGoalInput] = React.useState<string>("");
  const [agent, setAgent] = React.useState<AutonomousAgent | null>(null);
  const [customApiKey, setCustomApiKey] = React.useState<string>("");
  const [customModelName, setCustomModelName] =
    React.useState<string>(GPT_35_TURBO);
  const [customTemperature, setCustomTemperature] = React.useState<number>(0.9);
  const [customMaxLoops, setCustomMaxLoops] = React.useState<number>(
    DEFAULT_MAX_LOOPS_FREE
  );
  const [shouldAgentStop, setShouldAgentStop] = React.useState(false);

  const [messages, setMessages] = React.useState<Message[]>([]);

  const [showHelpDialog, setShowHelpDialog] = React.useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = React.useState(false);
  const [hasSaved, setHasSaved] = React.useState(false);
  const agentUtils = useAgent();

  useEffect(() => {
    const key = "g-modal-opened-new";
    const savedModalData = localStorage.getItem(key);

    // Momentarily always run
    setTimeout(() => {
      if (savedModalData == null) {
        setShowHelpDialog(true);
      }
    }, 3000);

    localStorage.setItem(key, JSON.stringify(true));
  }, []);

  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if (agent == null) {
      setShouldAgentStop(false);
    }
  }, [agent]);

  const handleAddMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const tasks = messages.filter((message) => message.type === "task");

  const disableDeployAgent = agent != null || name === "" || goalInput === ""

  const handleNewGoal = () => {
    const agent = new AutonomousAgent(
      name,
      goalInput,
      handleAddMessage,
      () => setAgent(null),
      { customApiKey, customModelName, customTemperature, customMaxLoops },
      session ?? undefined
    );
    setAgent(agent);
    setHasSaved(false);
    setMessages([]);
    agent.run().then(console.log).catch(console.error);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter'&& !disableDeployAgent) {
      if (!e.shiftKey) {
        // Only Enter is pressed, execute the function
        handleNewGoal();
      }
    }
  }

  const handleStopAgent = () => {
    setShouldAgentStop(true);
    agent?.stopAgent();
  };

  const proTitle = (
    <>
      g<span className="ml-1 text-amber-500/90">Pro</span>
    </>
  );

  const shouldShowSave =
    status === "authenticated" &&
    !agent?.isRunning &&
    messages.length &&
    !hasSaved;

  return (
    <DefaultLayout>
      <HelpDialog
        show={showHelpDialog}
        close={() => setShowHelpDialog(false)}
      />
      <SettingsDialog
        reactModelStates={{
          customApiKey,
          setCustomApiKey,
          customModelName,
          setCustomModelName,
          customTemperature,
          setCustomTemperature,
          customMaxLoops,
          setCustomMaxLoops,
        }}
        show={showSettingsDialog}
        close={() => setShowSettingsDialog(false)}
      />
      <main className="flex min-h-screen flex-row">
        {/* <Drawer
          showHelp={() => setShowHelpDialog(true)}
          showSettings={() => setShowSettingsDialog(true)}
        /> */}
        <div
          id="content"
          className="z-10 flex min-h-screen w-full items-center justify-center p-2 px-2 sm:px-4 md:px-10"
        >
          <div
            id="layout"
            className="flex h-full w-full max-w-screen-lg flex-col items-center justify-between gap-3 py-5 md:justify-center"
            style={{ width: "100%" }}          >
            <div
              id="title"
              className="relative flex flex-col items-center font-sans"
              style={{ width: "100%" }} 
            >
              <div className="flex flex-row items-start shadow-2xl" style={{ width: "100%" }} >
                {/* <span className="text-4xl font-bold text-[#C0C0C0] xs:text-5xl sm:text-6xl">
                  Agent
                </span>
                <span className="text-4xl font-bold text-white xs:text-5xl sm:text-6xl">
                  GPT
                </span> */}
                <PopIn delay={0.5} className="sm:absolute sm:right-0 sm:top-2" style={{ width: "100%" }} >
                  {/* <Badge>Beta 🚀</Badge> */}
                </PopIn>
              </div>
              <div className="mt-1 text-center font-sans text-[0.7em] font-bold text-white">
                {/* <p>
                  Assemble, configure, and deploy autonomous AI Agents in your
                  browser.
                </p> */}
              </div>
            </div>

            <Expand className="flex w-full flex-row">
            {tasks.length > 0 && <TaskWindow tasks={tasks} />}
              <ChatWindow
                className="sm:mt-4"
                messages={messages}
                title={session?.user.subscriptionId ? proTitle : "g"}
                showDonation={
                  status != "loading" && !session?.user.subscriptionId
                }
                onSave={
                  shouldShowSave
                    ? (format) => {
                        setHasSaved(true);
                        agentUtils.saveAgent({
                          goal: goalInput,
                          name: name,
                          tasks: messages,
                        });
                      }
                    : undefined
                }
                scrollToBottom
              />
           
            </Expand>

            <div className="flex w-full flex-col gap-2 sm:mt-4 md:mt-10">
              <Expand delay={1.2}>
                <Input
                  inputRef={nameInputRef}
                  // left={
                  //   <>
                  //     <FaRobot />
                  //     {/* <span className="ml-2">Name:</span> */}
                  //   </>
                  // }
                  value={name}
                  disabled={agent != null}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e)}
                  placeholder="g"
                />
              </Expand>
              <Expand delay={1.3}>
                <Input
                  // left={
                  //   <>
                  //     <FaStar />
                  //     {/* <span className="ml-2">Goal:</span> */}
                  //   </>
                  // }
                  disabled={agent != null}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e)}
                  placeholder=""
                  type='textarea'
                />
              </Expand>
            </div>

            <Expand delay={1.4} className="flex gap-2">
              <Button
                disabled={disableDeployAgent}
                onClick={handleNewGoal}
                className="sm:mt-100"
              >
                {agent == null ? (
                  "▶️"
                ) : (
                  <>
                    <VscLoading className="animate-spin" size={20} />
                    {/* <span className="ml-2">Running</span> */}
                  </>
                )}
              </Button>
              <Button
                disabled={agent == null}
                onClick={handleStopAgent}
                className="sm:mt-10"
                enabledClassName={"bg-red-600 hover:bg-red-400"}
              >
                {shouldAgentStop ? (
                  <>
                    <VscLoading className="animate-spin" size={20} />
                    <span className="ml-2">finishing...</span>
                  </>
                ) : (
                  "⏹️"
                )}
              </Button>
            </Expand>
          </div>
        </div>
      </main>
    </DefaultLayout>
  );
};

export default Home;
