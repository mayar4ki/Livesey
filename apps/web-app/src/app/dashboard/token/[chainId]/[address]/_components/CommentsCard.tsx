'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@acme/ui/card';
import { Input } from '@acme/ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

type Comment = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
};

// Mock data - replace with actual data
const mockComments: Comment[] = [
  {
    id: '1',
    author: '0x1234...5678',
    content: 'Great token! Looking forward to seeing it grow.',
    timestamp: '1 hour ago',
  },
  {
    id: '2',
    author: '0xabcd...efgh',
    content: 'Just bought some, excited about the project!',
    timestamp: '2 hours ago',
  },
];

export function CommentsCard() {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic will be implemented later
    console.log('Comment:', comment);
    setComment('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" size="sm" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Post Comment
          </Button>
        </form>

        <div className="space-y-4 mt-6 max-h-[500px] overflow-y-auto">
          {mockComments.map((comment) => (
            <div key={comment.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-sm">{comment.author}</div>
                <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          ))}
          {mockComments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

