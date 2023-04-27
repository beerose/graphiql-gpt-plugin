import React, { useRef } from 'react';
import { GraphiQLPlugin, useSchemaContext } from '@graphiql/react';

type Status = 'idle' | 'loading' | { type: 'error'; message: string } | 'success';

export type GptPluginProps = {
  onResult: (result: string) => void;
};
const Plugin = ({ onResult }: GptPluginProps) => {
  const [prompt, setPrompt] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');

  // todo
  const schema = useSchemaContext()?.schema;

  const onPromptRun = async () => {
    if (status === 'loading') return;
    if (!prompt) return;

    setStatus('loading');
    const result = await fetch('http://localhost:5173/gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        schema,
      }),
    });

    const response = await result.json();

    if (response && typeof response === 'object' && 'errorMessage' in response) {
      setStatus({ type: 'error', message: response.errorMessage });
      return;
    }

    onResult(response.text);
    setStatus('success');

    setTimeout(() => {
      setStatus('idle');
    }, 2000);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        marginLeft: '0',
        background: 'hsla(var(--color-neutral),var(--alpha-background-light))',
        borderRadius: 'calc(var(--border-radius-12) + var(--px-8))',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 'var(--px-8)',
      }}
    >
      <div
        style={{
          height: 'var(--session-header-height)',
          color: 'hsla(var(--color-neutral),var(--alpha-secondary))',
          alignSelf: 'center',
          padding: 'var(--px-12)',
        }}
      >
        GPT prompt:{' '}
      </div>
      <textarea
        style={{
          padding: '1rem',
          margin: '0 var(--px-8)',
          boxSizing: 'border-box',
          border: 'none',
          resize: 'none',
          overflow: 'auto',
          borderRadius: 'calc(var(--border-radius-12) + var(--px-8))',
          boxShadow: 'var(--popover-box-shadow)',
          height: '50%',
          backgroundColor: 'hsl(var(--color-base))',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          color: 'hsla(var(--color-neutral),var(--alpha-secondary))',
        }}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
      />
      <div
        style={{
          margin: 'var(--px-8)',
        }}
      >
        <button onClick={onPromptRun}>
          {status === 'idle' && <div>Run</div>}
          {status === 'loading' && <div>Loading...</div>}
          {status === 'success' && <div>Done!</div>}
        </button>
        {typeof status === 'object' && <div>{status.message}</div>}
      </div>
    </div>
  );
};

export const useGptPlugin = (props: GptPluginProps) => {
  const propsRef = useRef(props);
  propsRef.current = props;

  const pluginRef = useRef<GraphiQLPlugin>();
  pluginRef.current ||= {
    title: 'GPT Plugin',
    icon: () => (
      <svg
        fill="currentColor"
        height="200px"
        width="200px"
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <g>
            <g>
              <g>
                <path d="M452.864,21.312H59.136C26.469,21.312,0,47.781,0,80.448v244.395c0,32.667,26.469,59.136,59.136,59.136h252.027 l100.418,100.418C425.021,497.836,448,488.318,448,469.312v-85.333h4.864c32.667,0,59.136-26.469,59.136-59.136V80.448 C512,47.781,485.531,21.312,452.864,21.312z M469.333,324.843c0,9.103-7.366,16.469-16.469,16.469h-26.197 c-11.782,0-21.333,9.551-21.333,21.333v55.163L292.418,304.894c-8.331-8.331-21.839-8.331-30.17,0 c-8.331,8.331-8.331,21.839,0,30.17l6.248,6.248H59.136c-9.103,0-16.469-7.366-16.469-16.469V80.448 c0-9.103,7.366-16.469,16.469-16.469h393.728c9.103,0,16.469,7.366,16.469,16.469V324.843z"></path>
                <path d="M128,149.312c-23.573,0-42.667,19.093-42.667,42.667c0,23.573,19.093,42.667,42.667,42.667 c23.573,0,42.667-19.093,42.667-42.667C170.667,168.405,151.573,149.312,128,149.312z"></path>
                <path d="M256,149.312c-23.573,0-42.667,19.093-42.667,42.667c0,23.573,19.093,42.667,42.667,42.667s42.667-19.093,42.667-42.667 C298.667,168.405,279.573,149.312,256,149.312z"></path>
                <path d="M384,149.312c-23.573,0-42.667,19.093-42.667,42.667c0,23.573,19.093,42.667,42.667,42.667 c23.573,0,42.667-19.093,42.667-42.667C426.667,168.405,407.573,149.312,384,149.312z"></path>
              </g>
            </g>
          </g>
        </g>
      </svg>
    ),
    content: () => <Plugin {...propsRef.current} />,
  };

  return pluginRef.current;
};
