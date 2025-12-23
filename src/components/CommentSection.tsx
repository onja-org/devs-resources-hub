'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Comment } from '@/types/resource';
import { addDoc, collection, Timestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CommentSectionProps {
  resourceId: string;
  comments: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  resourceId: string;
  level?: number;
}

interface UserProfile {
  name: string;
  email: string;
}

function CommentItem({ comment, resourceId, level = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    async function fetchUserName() {
      try {
        const userDoc = await getDoc(doc(db, 'users', comment.userId));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserName(profile.name);
        } else {
          setUserName('Unknown User');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUserName('Unknown User');
      }
    }
    fetchUserName();
  }, [comment.userId]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const newReply: Omit<Comment, 'id'> = {
        userId: user.uid,
        text: replyText.trim(),
        createdAt: Timestamp.now(),
        replies: [],
      };

      const commentRef = await addDoc(collection(db, 'resources', resourceId, 'comments'), {
        ...newReply,
        parentId: comment.id,
      });

      const replyWithId: Comment = {
        ...newReply,
        id: commentRef.id,
      };

      setReplies([...replies, replyWithId]);
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = comment.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date';

  return (
    <div className={`${level > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {userName ? userName.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userName || 'Loading...'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {comment.text}
        </p>

        {level < 3 && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Reply
          </button>
        )}

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={2}
              disabled={isSubmitting}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !replyText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              resourceId={resourceId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ resourceId, comments: initialComments }: CommentSectionProps) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const newComment: Omit<Comment, 'id'> = {
        userId: user.uid,
        text: commentText.trim(),
        createdAt: Timestamp.now(),
        replies: [],
      };

      const commentRef = await addDoc(collection(db, 'resources', resourceId, 'comments'), {
        ...newComment,
        parentId: null,
      });

      const commentWithId: Comment = {
        ...newComment,
        id: commentRef.id,
      };

      setComments([commentWithId, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
            rows={3}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to leave a comment
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              resourceId={resourceId}
            />
          ))
        )}
      </div>
    </div>
  );
}
