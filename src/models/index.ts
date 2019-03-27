import { getRepository, getCustomRepository } from 'typeorm';
import { Instance } from './entities/instance';
import { Following } from './entities/following';
import { Emoji } from './entities/emoji';
import { App } from './entities/app';
import { PollVote } from './entities/poll-vote';
import { Notification } from './entities/notification';
import { Meta } from './entities/meta';
import { SwSubscription } from './entities/sw-subscription';
import { NoteWatching } from './entities/note-watching';
import { UserListJoining } from './entities/user-list-joining';
import { Hashtag } from './entities/hashtag';
import { NoteUnread } from './entities/note-unread';
import { NoteFavorite } from './entities/note-favorite';
import { AbuseUserReport } from './entities/abuse-user-report';
import { RegistrationTicket } from './entities/registration-tickets';
import { AuthSession } from './entities/auth-session';
import { ReversiMatching } from './entities/games/reversi/matching';
import { UserRepository } from './repositories/user';
import { NoteRepository } from './repositories/note';
import { DriveFileRepository } from './repositories/drive-file';
import { DriveFolderRepository } from './repositories/drive-folder';
import { Log } from './entities/log';
import { AccessToken } from './entities/access-token';
import { UserNotePining } from './entities/user-note-pinings';
import { SigninRepository } from './repositories/signin';
import { MessagingMessageRepository } from './repositories/messaging-message';
import { ReversiGameRepository } from './repositories/games/reversi/game';
import { UserListRepository } from './repositories/user-list';
import { FollowRequestRepository } from './repositories/follow-request';
import { MutingRepository } from './repositories/muting';
import { BlockingRepository } from './repositories/blocking';
import { NoteReactionRepository } from './repositories/note-reaction';

export const Apps = getRepository(App);
export const Notes = getCustomRepository(NoteRepository);
export const NoteFavorites = getRepository(NoteFavorite);
export const NoteWatchings = getRepository(NoteWatching);
export const NoteReactions = getCustomRepository(NoteReactionRepository);
export const NoteUnreads = getRepository(NoteUnread);
export const PollVotes = getRepository(PollVote);
export const Users = getCustomRepository(UserRepository);
export const UserLists = getCustomRepository(UserListRepository);
export const UserListJoinings = getRepository(UserListJoining);
export const UserNotePinings = getRepository(UserNotePining);
export const Followings = getRepository(Following);
export const FollowRequests = getCustomRepository(FollowRequestRepository);
export const Instances = getRepository(Instance);
export const Emojis = getRepository(Emoji);
export const DriveFiles = getCustomRepository(DriveFileRepository);
export const DriveFolders = getCustomRepository(DriveFolderRepository);
export const Notifications = getRepository(Notification);
export const Metas = getRepository(Meta);
export const Mutings = getCustomRepository(MutingRepository);
export const Blockings = getCustomRepository(BlockingRepository);
export const SwSubscriptions = getRepository(SwSubscription);
export const Hashtags = getRepository(Hashtag);
export const AbuseUserReports = getRepository(AbuseUserReport);
export const RegistrationTickets = getRepository(RegistrationTicket);
export const AuthSessions = getRepository(AuthSession);
export const AccessTokens = getRepository(AccessToken);
export const Signins = getCustomRepository(SigninRepository);
export const MessagingMessages = getCustomRepository(MessagingMessageRepository);
export const ReversiGames = getCustomRepository(ReversiGameRepository);
export const ReversiMatchings = getRepository(ReversiMatching);
export const Logs = getRepository(Log);
