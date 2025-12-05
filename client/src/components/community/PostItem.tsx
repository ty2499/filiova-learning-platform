import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Edit, Trash2, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { ReplyItem } from './ReplyItem';
import { EditPostDialog } from './EditPostDialog';
import { EditReplyDialog } from './EditReplyDialog';

interface Post {
  id: string;
  title: string;
  content: string;
  subject?: string;
  createdAt: string;
  likes: number;
  replyCount: number;
  likedByCurrentUser: boolean;
  author: {
    id: string;
    name: string;
    profilePic?: string;
  };
}

interface Reply {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    profilePic?: string;
  };
}

interface PostItemProps {
  post: Post;
  currentUserId: string;
  onLike: () => void;
  onEdit: (data: { title: string; content: string; subject?: string }) => void;
  onDelete: () => void;
}

export function PostItem({ post, currentUserId, onLike, onEdit, onDelete }: PostItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReply, setEditingReply] = useState<Reply | null>(null);
  const [showEditReplyDialog, setShowEditReplyDialog] = useState(false);
  const queryClient = useQueryClient();

  const isAuthor = post.author.id === currentUserId;

  // Fetch replies when expanded
  const { data: replies = [], isLoading: repliesLoading } = useQuery({
    queryKey: ['/api/community/posts', post.id, 'replies'],
    queryFn: () => apiRequest(`/api/community/posts/${post.id}/replies`),
    enabled: showReplies
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest('/api/community/replies', {
        method: 'POST',
        body: JSON.stringify({ postId: post.id, content })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts', post.id, 'replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
      setReplyContent('');
    }
  });

  const handleReply = () => {
    if (replyContent.trim()) {
      createReplyMutation.mutate(replyContent);
    }
  };

  const handleEdit = (data: { title: string; content: string; subject?: string }) => {
    onEdit(data);
    setShowEditDialog(false);
  };

  // Edit reply mutation
  const editReplyMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiRequest(`/api/community/replies/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts', post.id, 'replies'] });
      setShowEditReplyDialog(false);
      setEditingReply(null);
    }
  });

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: string) =>
      apiRequest(`/api/community/replies/${replyId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts', post.id, 'replies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] });
    }
  });

  const handleEditReply = (reply: Reply) => {
    setEditingReply(reply);
    setShowEditReplyDialog(true);
  };

  const handleUpdateReply = (data: { content: string }) => {
    if (editingReply) {
      editReplyMutation.mutate({ id: editingReply.id, content: data.content });
    }
  };

  const handleDeleteReply = (replyId: string) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      deleteReplyMutation.mutate(replyId);
    }
  };

  return (
    <>
      <Card data-testid={`post-${post.id}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.profilePic} />
                <AvatarFallback>
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{post.author.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.subject && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary">{post.subject}</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Edit/Delete buttons for author only */}
            {isAuthor && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  data-testid={`edit-post-${post.id}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  data-testid={`delete-post-${post.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <CardTitle className="text-lg">{post.title}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-4">{post.content}</p>
          
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={post.likedByCurrentUser ? 'text-red-500' : ''}
              data-testid={`like-post-${post.id}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.likedByCurrentUser ? 'fill-current' : ''}`} />
              {post.likes}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              data-testid={`replies-post-${post.id}`}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.replyCount} replies
            </Button>
          </div>

          {/* Replies Section */}
          {showReplies && (
            <div className="border-t pt-4">
              <div className="space-y-3 mb-4">
                {repliesLoading ? (
                  <div className="text-sm text-muted-foreground">Loading replies...</div>
                ) : replies.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No replies yet</div>
                ) : (
                  replies.map((reply: Reply) => (
                    <ReplyItem 
                      key={reply.id} 
                      reply={reply} 
                      currentUserId={currentUserId}
                      onEdit={() => handleEditReply(reply)}
                      onDelete={() => handleDeleteReply(reply.id)}
                    />
                  ))
                )}
              </div>
              
              {/* Reply Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                  data-testid={`reply-input-${post.id}`}
                />
                <Button 
                  size="sm" 
                  onClick={handleReply}
                  disabled={!replyContent.trim() || createReplyMutation.isPending}
                  data-testid={`reply-submit-${post.id}`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
      <EditPostDialog
        post={post}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleEdit}
      />

      {/* Edit Reply Dialog */}
      {editingReply && (
        <EditReplyDialog
          reply={editingReply}
          open={showEditReplyDialog}
          onOpenChange={setShowEditReplyDialog}
          onSubmit={handleUpdateReply}
          isLoading={editReplyMutation.isPending}
        />
      )}
    </>
  );
}
