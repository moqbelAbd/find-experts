using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models.Enums
{

    public enum UserStatusEnum
    {
        Active = 1,
        Pending = 2,
        Banned = 3,
        InActive = 4
    }

    public enum PostTypeEnum
    {
        Question = 1,
        Service = 2,
        Job = 3
    }

    public enum PostStatusEnum
    {
        Open = 1,
        Completed = 2,
        Cancelled = 3,
        Deleted = 4
    }

    public enum EmploymentTypeEnum
    {
        FullTime = 1,
        PartTime = 2,
        Contract = 3,
        Freelance = 4
    }

    public enum WorkLocationTypeEnum
    {
        Remote = 1,
        OnSite = 2,
        Hybrid = 3
    }

    public enum BookingStatusEnum
    {
        Pending = 1,
        Accepted = 2,
        Completed = 3,
        Cancelled = 4
    }

    public enum NotificationTypeEnum
    {
        NewMessage = 1,
        BookingRequest = 2,
        BookingAccepted = 3,
        BookingCancelled = 4,
        NewComment = 5,
    }
}