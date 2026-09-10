import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PollEmbed } from './PollEmbed'

interface Props {
  children: string
  className?: string
}

export function MarkdownContent({ children, className = '' }: Props) {
  return (
    <div className={`landing-prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children: codeChildren, ...props }) {
            const language = /language-(\w+)/.exec(codeClassName || '')?.[1]
            if (language === 'poll') {
              const pollId = String(codeChildren).trim()
              return <PollEmbed pollId={pollId} />
            }
            return (
              <code className={codeClassName} {...props}>
                {codeChildren}
              </code>
            )
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
